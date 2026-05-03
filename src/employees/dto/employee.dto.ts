import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'employee@courier.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'Ahmed Khan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiPropertyOptional({ example: 'Agent' })
  @IsOptional()
  @IsString()
  position?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
