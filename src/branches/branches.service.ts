import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
  buildPaginationArgs,
} from '../common/dto';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.branch.findMany({
        skip,
        take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
      }),
      this.prisma.branch.count(),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(dto: CreateBranchDto) {
    return this.prisma.branch.create({ data: dto });
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findOne(id);
    return this.prisma.branch.update({ where: { id }, data: dto });
  }
}
