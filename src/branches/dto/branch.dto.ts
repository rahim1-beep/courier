import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Lahore Branch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Lahore' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '123 Main St, Lahore' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: ['192.168.1.1', '10.0.0.1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIPs?: string[];
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
