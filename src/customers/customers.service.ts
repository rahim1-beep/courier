import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
  buildPaginationArgs,
} from '../common/dto';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const where = { deletedAt: null };
    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        include: {
          user: { select: { id: true, email: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    // Auto-generate password if not provided
    const rawPassword = dto.password || uuidv4().substring(0, 12);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: Role.CUSTOMER,
        },
      });

      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          name: dto.name,
          companyName: dto.companyName,
          address: dto.address,
          contact: dto.contact,
          postalCode: dto.postalCode,
          country: dto.country || 'PK',
          customPricing: dto.customPricing || false,
        },
        include: {
          user: { select: { id: true, email: true } },
        },
      });

      return customer;
    });

    return {
      ...result,
      generatedPassword: dto.password ? undefined : rawPassword,
    };
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    if (dto.name) data.name = dto.name;
    if (dto.companyName !== undefined) data.companyName = dto.companyName;
    if (dto.address) data.address = dto.address;
    if (dto.contact) data.contact = dto.contact;
    if (dto.postalCode !== undefined) data.postalCode = dto.postalCode;
    if (dto.country) data.country = dto.country;
    if (dto.customPricing !== undefined) data.customPricing = dto.customPricing;

    return this.prisma.customer.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    const customer = await this.findOne(id);
    await this.prisma.$transaction([
      this.prisma.customer.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: customer.userId },
        data: { isActive: false, deletedAt: new Date() },
      }),
    ]);
    return { message: 'Customer deleted' };
  }

  async getDashboard(customerId: string) {
    const customer = await this.findOne(customerId);
    const [totalShipments, deliveredShipments, pendingShipments, invoices] =
      await Promise.all([
        this.prisma.shipment.count({
          where: { customerId, deletedAt: null },
        }),
        this.prisma.shipment.count({
          where: { customerId, status: 'DELIVERED', deletedAt: null },
        }),
        this.prisma.shipment.count({
          where: {
            customerId,
            status: { in: ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
            deletedAt: null,
          },
        }),
        this.prisma.invoice.findMany({
          where: { customerId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        companyName: customer.companyName,
      },
      stats: {
        totalShipments,
        deliveredShipments,
        pendingShipments,
      },
      recentInvoices: invoices,
    };
  }
}
