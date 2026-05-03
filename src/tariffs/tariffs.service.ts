import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto, PaginatedResponseDto, buildPaginationArgs,
} from '../common/dto';
import {
  CreateServiceDto, CreateTariffDto, CalculatePriceDto, CreateCustomerTariffDto,
} from './dto/tariff.dto';

@Injectable()
export class TariffsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Services CRUD ────────────────────────────────────────

  async findAllServices() {
    return this.prisma.service.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { countries: true, tariffs: true } } },
    });
  }

  async createService(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async updateService(id: string, data: Partial<CreateServiceDto> & { isActive?: boolean }) {
    return this.prisma.service.update({ where: { id }, data });
  }

  // ── Tariffs CRUD ─────────────────────────────────────────

  async findAllTariffs(
    query: PaginationQueryDto,
    serviceId?: string,
    countryCode?: string,
  ) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (serviceId) where.serviceId = serviceId;
    if (countryCode) where.countryCode = countryCode;

    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.tariff.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: { service: { select: { id: true, name: true, code: true } } },
      }),
      this.prisma.tariff.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async createTariff(dto: CreateTariffDto) {
    return this.prisma.tariff.create({
      data: {
        serviceId: dto.serviceId,
        countryCode: dto.countryCode,
        pricePerKg: dto.pricePerKg,
        basePrice: dto.basePrice,
        minWeight: dto.minWeight || 0,
        maxWeight: dto.maxWeight,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      },
    });
  }

  async updateTariff(id: string, data: Partial<CreateTariffDto>) {
    return this.prisma.tariff.update({ where: { id }, data: data as Record<string, unknown> });
  }

  async createCustomerTariff(dto: CreateCustomerTariffDto) {
    return this.prisma.customerTariff.upsert({
      where: {
        customerId_serviceId: {
          customerId: dto.customerId,
          serviceId: dto.serviceId,
        },
      },
      update: { pricePerKg: dto.pricePerKg, basePrice: dto.basePrice },
      create: dto,
    });
  }

  // ── Pricing Engine ───────────────────────────────────────

  async calculatePrice(dto: CalculatePriceDto) {
    // Check country restriction
    const serviceCountry = await this.prisma.serviceCountry.findFirst({
      where: { serviceId: dto.serviceId, countryCode: dto.countryCode },
    });
    if (serviceCountry?.isRestricted) {
      throw new BadRequestException(
        `Service does not support country: ${dto.countryCode}`,
      );
    }

    // Check custom pricing
    if (dto.customerId) {
      const customerTariff = await this.prisma.customerTariff.findUnique({
        where: {
          customerId_serviceId: {
            customerId: dto.customerId,
            serviceId: dto.serviceId,
          },
        },
      });
      if (customerTariff) {
        const baseCost = Number(customerTariff.basePrice);
        const weightCost = Number(customerTariff.pricePerKg) * dto.weight;
        return {
          baseCost,
          weightCost,
          totalCost: baseCost + weightCost,
          pricingType: 'CUSTOM',
        };
      }
    }

    // Standard tariff lookup
    const tariff = await this.prisma.tariff.findFirst({
      where: {
        serviceId: dto.serviceId,
        countryCode: dto.countryCode,
        deletedAt: null,
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!tariff) {
      throw new NotFoundException('No applicable tariff found');
    }

    // Validate weight against tariff bounds
    const minWeight = tariff.minWeight ? Number(tariff.minWeight) : 0;
    const maxWeight = tariff.maxWeight ? Number(tariff.maxWeight) : null;
    if (dto.weight < minWeight) {
      throw new BadRequestException(
        `Weight ${dto.weight}kg is below the minimum of ${minWeight}kg for this tariff`,
      );
    }
    if (maxWeight !== null && dto.weight > maxWeight) {
      throw new BadRequestException(
        `Weight ${dto.weight}kg exceeds the maximum of ${maxWeight}kg for this tariff`,
      );
    }

    const baseCost = Number(tariff.basePrice);
    const weightCost = Number(tariff.pricePerKg) * dto.weight;
    return {
      baseCost,
      weightCost,
      totalCost: baseCost + weightCost,
      pricingType: 'STANDARD',
      tariffId: tariff.id,
    };
  }
}
