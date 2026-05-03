import {
  Controller, Get, Post, Param, Body, Query,
  UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ManifestsService } from './manifests.service';
import { CreateManifestDto } from './dto/manifest.dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { PaginationQueryDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Manifests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/manifests')
export class ManifestsController {
  constructor(
    private readonly manifestsService: ManifestsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List manifests (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.manifestsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get manifest with linked shipments' })
  findOne(@Param('id') id: string) {
    return this.manifestsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Create manifest' })
  async create(
    @Body() dto: CreateManifestDto,
    @CurrentUser('userId') userId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new BadRequestException('Employee profile required');
    return this.manifestsService.create(dto, employee.id);
  }

  @Post('bulk-generate')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bulk generate manifests from shipment IDs' })
  async bulkGenerate(
    @Body() body: { shipmentIds: string[]; branchId: string },
    @CurrentUser('userId') userId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new BadRequestException('Employee profile required');
    return this.manifestsService.bulkGenerate(
      body.shipmentIds, body.branchId, employee.id,
    );
  }
}
