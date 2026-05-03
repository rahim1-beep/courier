import {
  Controller, Get, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles(Role.EMPLOYEE)
  @ApiOperation({ summary: 'Check in (validates IP against branch)' })
  checkIn(@CurrentUser('userId') userId: string, @Req() req: Request) {
    return this.attendanceService.checkIn(userId, req);
  }

  @Get('my')
  @Roles(Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get own attendance records' })
  getMyAttendance(
    @CurrentUser('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.attendanceService.getMyAttendance(userId, query);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all attendance records (admin)' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  getAll(
    @Query() query: PaginationQueryDto,
    @Query('employeeId') employeeId?: string,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.getAttendanceRecords(query, employeeId, date);
  }
}
