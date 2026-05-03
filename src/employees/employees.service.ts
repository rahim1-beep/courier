import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
  buildPaginationArgs,
} from '../common/dto';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto, branchId?: string) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (branchId) where.branchId = branchId;

    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        include: { branch: { select: { id: true, name: true, city: true } } },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        branch: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async create(dto: CreateEmployeeDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: Role.EMPLOYEE,
        },
      });

      return tx.employee.create({
        data: {
          userId: user.id,
          branchId: dto.branchId,
          name: dto.name,
          contact: dto.contact,
          position: dto.position || 'Agent',
        },
        include: {
          branch: { select: { id: true, name: true } },
          user: { select: { id: true, email: true, role: true } },
        },
      });
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    if (dto.name) data.name = dto.name;
    if (dto.contact) data.contact = dto.contact;
    if (dto.position) data.position = dto.position;
    if (dto.branchId) data.branchId = dto.branchId;

    return this.prisma.employee.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    const employee = await this.findOne(id);
    await this.prisma.$transaction([
      this.prisma.employee.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: employee.userId },
        data: { isActive: false, deletedAt: new Date() },
      }),
    ]);
    return { message: 'Employee deleted' };
  }
}
