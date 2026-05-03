import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateManifestDto {
  @ApiProperty() @IsString() @IsNotEmpty() branchId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty({ type: [String], description: 'Array of shipment IDs' })
  @IsArray()
  @IsString({ each: true })
  shipmentIds: string[];
}
