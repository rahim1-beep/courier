import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List all branches (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.branchesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new branch' })
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update branch' })
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, dto);
  }
}
