import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { TariffsService } from './tariffs.service';
import {
  CreateServiceDto, CreateTariffDto, CalculatePriceDto, CreateCustomerTariffDto,
} from './dto/tariff.dto';
import { Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Services & Tariffs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Get('services')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE, Role.CUSTOMER)
  @ApiOperation({ summary: 'List all courier services' })
  findAllServices() {
    return this.tariffsService.findAllServices();
  }

  @Post('services')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create courier service' })
  createService(@Body() dto: CreateServiceDto) {
    return this.tariffsService.createService(dto);
  }

  @Patch('services/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update courier service' })
  updateService(@Param('id') id: string, @Body() dto: Partial<CreateServiceDto>) {
    return this.tariffsService.updateService(id, dto);
  }

  @Get('tariffs')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List tariffs (paginated)' })
  @ApiQuery({ name: 'serviceId', required: false })
  @ApiQuery({ name: 'countryCode', required: false })
  findAllTariffs(
    @Query() query: PaginationQueryDto,
    @Query('serviceId') serviceId?: string,
    @Query('countryCode') countryCode?: string,
  ) {
    return this.tariffsService.findAllTariffs(query, serviceId, countryCode);
  }

  @Post('tariffs')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create tariff' })
  createTariff(@Body() dto: CreateTariffDto) {
    return this.tariffsService.createTariff(dto);
  }

  @Patch('tariffs/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update tariff' })
  updateTariff(@Param('id') id: string, @Body() dto: Partial<CreateTariffDto>) {
    return this.tariffsService.updateTariff(id, dto);
  }

  @Post('tariffs/calculate')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Calculate shipment price' })
  calculatePrice(@Body() dto: CalculatePriceDto) {
    return this.tariffsService.calculatePrice(dto);
  }

  @Post('tariffs/customer')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Set custom pricing for a customer' })
  createCustomerTariff(@Body() dto: CreateCustomerTariffDto) {
    return this.tariffsService.createCustomerTariff(dto);
  }
}
