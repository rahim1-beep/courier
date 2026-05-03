import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ShipmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
  buildPaginationArgs,
} from '../common/dto';
import { generateTrackingId } from '../common/utils';
import { CreateShipmentDto, UpdateShipmentStatusDto } from './dto/shipment.dto';

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQueryDto,
    filters?: {
      branchId?: string;
      customerId?: string;
      status?: ShipmentStatus;
      serviceId?: string;
    },
  ) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters?.branchId) where.branchId = filters.branchId;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.status) where.status = filters.status;
    if (filters?.serviceId) where.serviceId = filters.serviceId;

    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
          service: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true } },
          employee: { select: { id: true, name: true } },
        },
      }),
      this.prisma.shipment.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: { select: { id: true, name: true, companyName: true } },
        service: true,
        branch: true,
        employee: { select: { id: true, name: true } },
        detail: true,
        statusLogs: { orderBy: { timestamp: 'desc' } },
        pieces: { orderBy: { pieceNumber: 'asc' } },
      },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async create(dto: CreateShipmentDto, employeeId: string) {
    const trackingId = generateTrackingId();

    // Calculate cost via tariff engine
    const cost = await this.calculateCost(
      dto.serviceId,
      dto.detail.receiverCountry,
      dto.weight,
      dto.customerId,
    );

    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          trackingId,
          customerId: dto.customerId,
          employeeId,
          branchId: dto.branchId,
          serviceId: dto.serviceId,
          weight: dto.weight,
          cost,
          status: ShipmentStatus.CREATED,
          detail: {
            create: dto.detail,
          },
          statusLogs: {
            create: {
              status: ShipmentStatus.CREATED,
              note: 'Shipment created',
            },
          },
          ...(dto.pieces && dto.pieces.length > 0
            ? {
                pieces: {
                  create: dto.pieces.map((p) => ({
                    pieceNumber: p.pieceNumber,
                    weight: p.weight,
                    description: p.description,
                  })),
                },
              }
            : {}),
        },
        include: {
          detail: true,
          statusLogs: true,
          pieces: true,
          service: { select: { name: true } },
        },
      });

      return shipment;
    });
  }

  async updateStatus(id: string, dto: UpdateShipmentStatusDto) {
    const shipment = await this.findOne(id);

    // Validate status transition
    this.validateStatusTransition(shipment.status, dto.status);

    return this.prisma.$transaction([
      this.prisma.shipment.update({
        where: { id },
        data: { status: dto.status },
      }),
      this.prisma.shipmentStatusLog.create({
        data: {
          shipmentId: id,
          status: dto.status,
          note: dto.note,
        },
      }),
    ]);
  }

  async getTracking(id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, deletedAt: null },
      select: {
        trackingId: true,
        status: true,
        createdAt: true,
        service: { select: { name: true } },
        detail: {
          select: {
            senderCountry: true,
            receiverCountry: true,
            receiverName: true,
          },
        },
        statusLogs: {
          orderBy: { timestamp: 'desc' },
          select: { status: true, note: true, timestamp: true },
        },
      },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async findByCustomer(customerId: string, query: PaginationQueryDto) {
    return this.findAll(query, { customerId });
  }

  // ── Private Helpers ──────────────────────────────────────

  private async calculateCost(
    serviceId: string,
    countryCode: string,
    weight: number,
    customerId?: string,
  ): Promise<number> {
    // Check custom pricing first
    if (customerId) {
      const customerTariff = await this.prisma.customerTariff.findUnique({
        where: {
          customerId_serviceId: { customerId, serviceId },
        },
      });
      if (customerTariff) {
        return (
          Number(customerTariff.basePrice) +
          Number(customerTariff.pricePerKg) * weight
        );
      }
    }

    // Standard tariff
    const tariff = await this.prisma.tariff.findFirst({
      where: {
        serviceId,
        countryCode,
        deletedAt: null,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!tariff) {
      throw new BadRequestException(
        `No tariff found for service/country combination`,
      );
    }

    // Validate weight against tariff bounds
    const minWeight = tariff.minWeight ? Number(tariff.minWeight) : 0;
    const maxWeight = tariff.maxWeight ? Number(tariff.maxWeight) : null;
    if (weight < minWeight) {
      throw new BadRequestException(
        `Weight ${weight}kg is below the minimum of ${minWeight}kg`,
      );
    }
    if (maxWeight !== null && weight > maxWeight) {
      throw new BadRequestException(
        `Weight ${weight}kg exceeds the maximum of ${maxWeight}kg`,
      );
    }

    return Number(tariff.basePrice) + Number(tariff.pricePerKg) * weight;
  }

  private validateStatusTransition(
    current: ShipmentStatus,
    next: ShipmentStatus,
  ): void {
    const allowed: Record<ShipmentStatus, ShipmentStatus[]> = {
      CREATED: [ShipmentStatus.PICKED_UP, ShipmentStatus.CANCELLED],
      PICKED_UP: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.ON_HOLD],
      IN_TRANSIT: [
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.ON_HOLD,
        ShipmentStatus.RETURNED,
      ],
      OUT_FOR_DELIVERY: [
        ShipmentStatus.DELIVERED,
        ShipmentStatus.ON_HOLD,
        ShipmentStatus.RETURNED,
      ],
      DELIVERED: [],
      ON_HOLD: [
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.RETURNED,
        ShipmentStatus.CANCELLED,
      ],
      RETURNED: [],
      CANCELLED: [],
    };

    if (!allowed[current]?.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from ${current} to ${next}`,
      );
    }
  }
}
