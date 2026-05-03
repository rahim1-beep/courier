import {
  Controller, Get, Post, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/inventory.dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { PaginationQueryDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List inventory (paginated)' })
  @ApiQuery({ name: 'branchId', required: false })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('branchId') branchId?: string,
    @Query('customerId') customerId?: string,
  ) {
    if (customerId) (query as any).customerId = customerId;
    return this.inventoryService.findAll(query, branchId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get inventory with items' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Create inventory entry' })
  async create(
    @Body() dto: CreateInventoryDto,
    @CurrentUser('userId') userId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId },
    });
    if (!employee) throw new BadRequestException('Employee profile required');
    return this.inventoryService.create(dto, employee.id);
  }

  @Post('bulk-upload')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk upload inventory via CSV' })
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Query('branchId') branchId: string,
    @Query('customerId') customerId: string,
    @CurrentUser('userId') userId: string,
  ) {
    if (!file) throw new BadRequestException('File is required');

    const maxSizeMB = this.config.get<number>('MAX_UPLOAD_SIZE_MB', 10);
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new BadRequestException(`File exceeds ${maxSizeMB}MB limit`);
    }

    const employee = await this.prisma.employee.findFirst({
      where: { userId },
    });
    if (!employee) throw new BadRequestException('Employee profile required');

    const records = parse(file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;

    const maxRows = this.config.get<number>('MAX_UPLOAD_ROWS', 5000);
    if (records.length > maxRows) {
      throw new BadRequestException(
        `File contains ${records.length} rows, exceeding the maximum of ${maxRows}`,
      );
    }

    const rows = records.map((r) => ({
      description: r.description || r.Description || '',
      weight: parseFloat(r.weight || r.Weight || '0'),
      quantity: parseInt(r.quantity || r.Quantity || '1', 10),
      trackingId: r.trackingId || r.TrackingId || undefined,
    }));

    return this.inventoryService.bulkUpload(rows, branchId, customerId, employee.id, maxRows);
  }
}
