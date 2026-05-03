import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role, ShipmentStatus } from '@prisma/client';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto, UpdateShipmentStatusDto } from './dto/shipment.dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard, CustomerOwnershipGuard } from '../common/guards';
import { PaginationQueryDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Shipments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/shipments')
export class ShipmentsController {
  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List shipments (paginated, filterable)' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ShipmentStatus })
  @ApiQuery({ name: 'serviceId', required: false })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('branchId') branchId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: ShipmentStatus,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.shipmentsService.findAll(query, {
      branchId, customerId, status, serviceId,
    });
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Get shipment with full details' })
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Create shipment' })
  async create(
    @Body() dto: CreateShipmentDto,
    @CurrentUser('userId') userId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId },
    });
    if (!employee) throw new BadRequestException('Employee profile required');
    return this.shipmentsService.create(dto, employee.id);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Update shipment status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateStatus(id, dto);
  }

  @Get(':id/tracking')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Get shipment tracking history' })
  getTracking(@Param('id') id: string) {
    return this.shipmentsService.getTracking(id);
  }

  @Get('customer/:customerId')
  @Roles(Role.SUPER_ADMIN, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Get shipments for a customer' })
  findByCustomer(
    @Param('customerId') customerId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.shipmentsService.findByCustomer(customerId, query);
  }
}
