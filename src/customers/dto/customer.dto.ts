import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsEmail, IsOptional, MinLength, IsBoolean,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'customer@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Auto-generated if not provided' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'ABC Corporation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ default: 'PK' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  customPricing?: boolean;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
