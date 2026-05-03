import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';
import { extractClientIp, isIpAllowed } from '../common/utils';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
  buildPaginationArgs,
} from '../common/dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check in an employee. Validates IP against branch allowed IPs.
   */
  async checkIn(userId: string, request: Request) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
      include: { branch: true },
    });

    if (!employee) {
      throw new Error('Employee profile not found');
    }

    const clientIp = extractClientIp(request);
    const allowed = isIpAllowed(clientIp, employee.branch.allowedIPs);
    const status: AttendanceStatus = allowed
      ? AttendanceStatus.PRESENT
      : AttendanceStatus.INVALID_IP;

    this.logger.log(
      `Attendance check-in: employee=${employee.id}, ip=${clientIp}, status=${status}`,
    );

    return this.prisma.attendance.create({
      data: {
        employeeId: employee.id,
        ipAddress: clientIp,
        status,
      },
      include: {
        employee: { select: { id: true, name: true } },
      },
    });
  }

  async getMyAttendance(userId: string, query: PaginationQueryDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!employee) throw new Error('Employee not found');

    const where = { employeeId: employee.id };
    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take,
        orderBy: { loginTime: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async getAttendanceRecords(
    query: PaginationQueryDto,
    employeeId?: string,
    date?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.loginTime = { gte: start, lt: end };
    }

    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take,
        orderBy: { loginTime: 'desc' },
        include: { employee: { select: { id: true, name: true } } },
      }),
      this.prisma.attendance.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }
}
