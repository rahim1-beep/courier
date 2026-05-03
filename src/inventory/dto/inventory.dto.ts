import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested,
  IsNumber, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingId?: string;
}

export class CreateInventoryDto {
  @ApiPropertyOptional({ description: 'Auto-generated if not provided' })
  @IsOptional()
  @IsString()
  inventoryCode?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateInventoryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryItemDto)
  items: CreateInventoryItemDto[];
}
