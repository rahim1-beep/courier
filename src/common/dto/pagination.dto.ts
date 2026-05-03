import { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../constants';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT, minimum: 1, maximum: MAX_LIMIT })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT;

  @ApiPropertyOptional()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

/**
 * Helper to build Prisma skip/take from pagination query.
 */
export function buildPaginationArgs(query: PaginationQueryDto) {
  return {
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  };
}
