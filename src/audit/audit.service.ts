import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponseDto, buildPaginationArgs } from '../common/dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQueryDto,
    filters?: { userId?: string; entity?: string; startDate?: string; endDate?: string },
  ) {
    const where: Record<string, unknown> = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters?.startDate) (where.timestamp as Record<string, Date>).gte = new Date(filters.startDate);
      if (filters?.endDate) (where.timestamp as Record<string, Date>).lte = new Date(filters.endDate);
    }

    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where, skip, take,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { id: true, email: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }
}
