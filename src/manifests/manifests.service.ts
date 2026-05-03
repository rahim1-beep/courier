import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto, PaginatedResponseDto, buildPaginationArgs,
} from '../common/dto';
import { generateManifestReference } from '../common/utils';
import { CreateManifestDto } from './dto/manifest.dto';

@Injectable()
export class ManifestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.manifest.findMany({
        skip, take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        include: {
          branch: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { shipments: true } },
        },
      }),
      this.prisma.manifest.count(),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const manifest = await this.prisma.manifest.findUnique({
      where: { id },
      include: {
        branch: true,
        createdBy: { select: { id: true, name: true } },
        shipments: {
          include: {
            shipment: {
              include: {
                detail: true,
                customer: { select: { id: true, name: true } },
                service: { select: { name: true } },
              },
            },
          },
        },
      },
    });
    if (!manifest) throw new NotFoundException('Manifest not found');
    return manifest;
  }

  async create(dto: CreateManifestDto, employeeId: string) {
    return this.prisma.manifest.create({
      data: {
        referenceNumber: generateManifestReference(),
        createdById: employeeId,
        branchId: dto.branchId,
        notes: dto.notes,
        shipments: {
          create: dto.shipmentIds.map((shipmentId) => ({ shipmentId })),
        },
      },
      include: {
        shipments: { include: { shipment: { select: { trackingId: true, status: true } } } },
      },
    });
  }

  async bulkGenerate(
    shipmentIds: string[],
    branchId: string,
    employeeId: string,
    chunkSize = 50,
  ) {
    const manifests = [];
    for (let i = 0; i < shipmentIds.length; i += chunkSize) {
      const chunk = shipmentIds.slice(i, i + chunkSize);
      const manifest = await this.create(
        { branchId, shipmentIds: chunk },
        employeeId,
      );
      manifests.push(manifest);
    }
    return { count: manifests.length, manifests };
  }
}
