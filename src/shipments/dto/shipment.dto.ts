import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsNumber, Min,
  IsEnum, IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentStatus } from '@prisma/client';

export class ShipmentDetailDto {
  @ApiProperty() @IsString() @IsNotEmpty() senderName: string;
  @ApiProperty() @IsString() @IsNotEmpty() senderAddress: string;
  @ApiProperty() @IsString() @IsNotEmpty() senderContact: string;
  @ApiPropertyOptional() @IsOptional() @IsString() senderPostalCode?: string;
  @ApiProperty() @IsString() @IsNotEmpty() senderCountry: string;

  @ApiProperty() @IsString() @IsNotEmpty() receiverName: string;
  @ApiProperty() @IsString() @IsNotEmpty() receiverAddress: string;
  @ApiProperty() @IsString() @IsNotEmpty() receiverContact: string;
  @ApiPropertyOptional() @IsOptional() @IsString() receiverPostalCode?: string;
  @ApiProperty() @IsString() @IsNotEmpty() receiverCountry: string;
}

export class ShipmentPieceDto {
  @ApiProperty() @IsNumber() @Min(1) pieceNumber: number;
  @ApiProperty() @IsNumber() @Min(0) weight: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class CreateShipmentDto {
  @ApiProperty() @IsString() @IsNotEmpty() customerId: string;
  @ApiProperty() @IsString() @IsNotEmpty() branchId: string;
  @ApiProperty() @IsString() @IsNotEmpty() serviceId: string;
  @ApiProperty() @IsNumber() @Min(0.01) weight: number;

  @ApiProperty({ type: ShipmentDetailDto })
  @ValidateNested()
  @Type(() => ShipmentDetailDto)
  detail: ShipmentDetailDto;

  @ApiPropertyOptional({ type: [ShipmentPieceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentPieceDto)
  pieces?: ShipmentPieceDto[];
}

export class UpdateShipmentStatusDto {
  @ApiProperty({ enum: ShipmentStatus })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
