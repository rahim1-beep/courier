import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
  buildPaginationArgs,
} from '../common/dto';
import { generateInventoryCode } from '../common/utils';
import { CreateInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto, branchId?: string) {
    const where: any = { deletedAt: null };
    if (branchId) where.branchId = branchId;
    if (query.search) {
      where.OR = [
        { inventoryCode: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    // Handle customerId filter if passed via custom query or part of query object
    const customerId = (query as any).customerId;
    if (customerId) where.customerId = customerId;

    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        include: {
          branch: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          uploadedBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.inventory.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id, deletedAt: null },
      include: {
        branch: true,
        uploadedBy: { select: { id: true, name: true } },
        items: true,
      },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return inventory;
  }

  async create(dto: CreateInventoryDto, employeeId: string) {
    const code = dto.inventoryCode || generateInventoryCode();

    return this.prisma.inventory.create({
      data: {
        inventoryCode: code,
        branchId: dto.branchId,
        customerId: dto.customerId,
        uploadedById: employeeId,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            weight: item.weight,
            quantity: item.quantity || 1,
            trackingId: item.trackingId,
          })),
        },
      },
      include: { items: true },
    });
  }

  /**
   * Bulk upload inventory items from parsed CSV/Excel rows.
   */
  async bulkUpload(
    rows: Array<{
      description: string;
      weight: number;
      quantity?: number;
      trackingId?: string;
    }>,
    branchId: string,
    customerId: string,
    employeeId: string,
    maxRows: number,
  ) {
    if (rows.length > maxRows) {
      throw new BadRequestException(
        `Upload exceeds maximum ${maxRows} rows. Got ${rows.length}.`,
      );
    }

    const errors: Array<{ row: number; error: string }> = [];
    const validItems: typeof rows = [];

    rows.forEach((row, index) => {
      if (!row.description || row.description.trim() === '') {
        errors.push({ row: index + 1, error: 'Description is required' });
      } else if (typeof row.weight !== 'number' || row.weight < 0) {
        errors.push({ row: index + 1, error: 'Weight must be a positive number' });
      } else {
        validItems.push(row);
      }
    });

    if (validItems.length === 0) {
      return { success: 0, errors, inventoryId: null };
    }

    const inventory = await this.prisma.inventory.create({
      data: {
        inventoryCode: generateInventoryCode(),
        branchId,
        customerId,
        uploadedById: employeeId,
        notes: `Bulk upload: ${validItems.length} items`,
        items: {
          create: validItems.map((item) => ({
            description: item.description,
            weight: item.weight,
            quantity: item.quantity || 1,
            trackingId: item.trackingId,
          })),
        },
      },
    });

    return {
      success: validItems.length,
      errors,
      inventoryId: inventory.id,
    };
  }
}
