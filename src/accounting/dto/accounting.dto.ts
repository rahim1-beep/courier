import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum,
  IsDateString, IsUUID, IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentMethod, LedgerReferenceType } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto';

export class LedgerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() customerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() branchId?: string;
  @ApiPropertyOptional({ enum: LedgerReferenceType })
  @IsOptional() @IsEnum(LedgerReferenceType) referenceType?: LedgerReferenceType;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isVoid?: boolean;
}

export class CreatePaymentDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() customerId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() invoiceId?: string;
  @ApiProperty() @IsNumber() @Min(0.01) amount: number;
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) method: PaymentMethod;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceNumber?: string;
  @ApiProperty() @IsDateString() receivedAt: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class CreateCreditNoteDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() customerId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() invoiceId: string;
  @ApiProperty() @IsNumber() @Min(0.01) amount: number;
  @ApiProperty() @IsString() @IsNotEmpty() reason: string;
}

export class VoidLedgerEntryDto {
  @ApiProperty() @IsString() @IsNotEmpty() reason: string;
}

export class ProfitLossQueryDto {
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() branchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serviceId?: string;
  @ApiPropertyOptional({ enum: ['day', 'week', 'month'], default: 'month' })
  @IsOptional() @IsString() groupBy?: 'day' | 'week' | 'month';
}

export class SalesSummaryQueryDto {
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() branchId?: string;
}

export class CustomerBalanceQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() asOf?: string;
}

export class OutstandingInvoicesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() customerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() branchId?: string;
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdueOnly?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  @Min(0)
  minAmount?: number;
}
