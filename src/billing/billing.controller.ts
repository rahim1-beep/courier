import {
  Controller, Get, Post, Param, Query, UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { BillingService } from './billing.service';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard, CustomerOwnershipGuard } from '../common/guards';
import { PaginationQueryDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Billing / Invoices')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/invoices')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List invoices (paginated)' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return this.billingService.findAll(query, customerId, status);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Get invoice details' })
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post('generate/:shipmentId')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate invoice from shipment (transactional)' })
  async generate(
    @Param('shipmentId') shipmentId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new BadRequestException('Employee profile required');
    return this.billingService.generateFromShipment(shipmentId, employee.id);
  }

  @Get(':id/pdf-data')
  @Roles(Role.SUPER_ADMIN, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Get structured invoice data for PDF rendering' })
  getPdfData(@Param('id') id: string) {
    return this.billingService.getPdfData(id);
  }

  @Get('customer/:customerId')
  @Roles(Role.SUPER_ADMIN, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Get invoices for a customer' })
  findByCustomer(
    @Param('customerId') customerId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.billingService.findByCustomer(customerId, query);
  }
}
