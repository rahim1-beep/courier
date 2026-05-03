import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard, CustomerOwnershipGuard } from '../common/guards';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all customers (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create customer (auto-generates login)' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update customer' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft-delete customer' })
  remove(@Param('id') id: string) {
    return this.customersService.softDelete(id);
  }

  @Get(':id/dashboard')
  @Roles(Role.SUPER_ADMIN, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Customer dashboard (shipment stats + invoices)' })
  getDashboard(@Param('id') id: string) {
    return this.customersService.getDashboard(id);
  }
}
