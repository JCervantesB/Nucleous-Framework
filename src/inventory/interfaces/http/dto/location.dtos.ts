import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    type: 'string',
    example: 'WH-001',
    description: 'Código único de ubicación',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    type: 'string',
    example: 'Almacén Central',
    description: 'Nombre de la ubicación',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    type: 'string',
    enum: ['INTERNAL', 'SUPPLIER', 'CUSTOMER', 'TRANSIT', 'ADJUSTMENT'],
    example: 'INTERNAL',
    description: 'Tipo de ubicación',
  })
  @IsString()
  type!: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'ID del contacto asociado',
  })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Calle y número' })
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Ciudad' })
  @IsOptional()
  @IsString()
  addressCity?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Estado' })
  @IsOptional()
  @IsString()
  addressState?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Código postal' })
  @IsOptional()
  @IsString()
  addressPostalCode?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Código de país' })
  @IsOptional()
  @IsString()
  addressCountryCode?: string;
}

export class UpdateLocationDto {
  @ApiPropertyOptional({ type: 'string', example: 'WH-002' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ type: 'string', example: 'Almacén Secundario' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: 'string',
    enum: ['INTERNAL', 'SUPPLIER', 'CUSTOMER', 'TRANSIT', 'ADJUSTMENT'],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  addressCity?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  addressState?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  addressPostalCode?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  addressCountryCode?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class LocationResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;

  @ApiProperty({ type: 'string' })
  code!: string;

  @ApiProperty({ type: 'string' })
  name!: string;

  @ApiProperty({
    type: 'string',
    enum: ['INTERNAL', 'SUPPLIER', 'CUSTOMER', 'TRANSIT', 'ADJUSTMENT'],
  })
  type!: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  contactId!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  addressStreet?: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  addressCity?: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  addressState?: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  addressPostalCode?: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  addressCountryCode?: string | null;

  @ApiProperty({ type: 'boolean' })
  isActive!: boolean;

  @ApiProperty({ type: 'boolean' })
  isTransit!: boolean;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  updatedAt!: Date | null;
}

export class LocationListResponseDto {
  @ApiProperty({ type: [LocationResponseDto] })
  data!: LocationResponseDto[];

  @ApiProperty({ type: 'number' })
  total!: number;

  @ApiProperty({ type: 'number' })
  page!: number;

  @ApiProperty({ type: 'number' })
  pageSize!: number;
}

export class ListLocationsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @ApiPropertyOptional({
    type: 'string',
    enum: ['INTERNAL', 'SUPPLIER', 'CUSTOMER', 'TRANSIT', 'ADJUSTMENT'],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  search?: string;
}
