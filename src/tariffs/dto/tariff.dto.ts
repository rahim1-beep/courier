import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean, IsDateString,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'DHL' }) @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ example: 'DHL' }) @IsString() @IsNotEmpty() code: string;
}

export class CreateServiceCountryDto {
  @ApiProperty() @IsString() @IsNotEmpty() serviceId: string;
  @ApiProperty({ example: 'GB' }) @IsString() @IsNotEmpty() countryCode: string;
  @ApiProperty({ example: 'United Kingdom' }) @IsString() @IsNotEmpty() countryName: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isRestricted?: boolean;
}

export class CreateTariffDto {
  @ApiProperty() @IsString() @IsNotEmpty() serviceId: string;
  @ApiProperty({ example: 'GB' }) @IsString() @IsNotEmpty() countryCode: string;
  @ApiProperty() @IsNumber() @Min(0) pricePerKg: number;
  @ApiProperty() @IsNumber() @Min(0) basePrice: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) minWeight?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maxWeight?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveTo?: string;
}

export class CalculatePriceDto {
  @ApiProperty() @IsString() @IsNotEmpty() serviceId: string;
  @ApiProperty({ example: 'GB' }) @IsString() @IsNotEmpty() countryCode: string;
  @ApiProperty() @IsNumber() @Min(0.01) weight: number;
  @ApiPropertyOptional() @IsOptional() @IsString() customerId?: string;
}

export class CreateCustomerTariffDto {
  @ApiProperty() @IsString() @IsNotEmpty() customerId: string;
  @ApiProperty() @IsString() @IsNotEmpty() serviceId: string;
  @ApiProperty() @IsNumber() @Min(0) pricePerKg: number;
  @ApiProperty() @IsNumber() @Min(0) basePrice: number;
}
