import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
} from 'class-validator';

export enum LocationTypeDto {
  INTERNAL = 'INTERNAL',
  SUPPLIER = 'SUPPLIER',
  CUSTOMER = 'CUSTOMER',
  TRANSIT = 'TRANSIT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class LocationAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class CreateLocationDto {
  @ApiProperty({ example: 'WH-001', description: 'Código único de ubicación' })
  @IsString()
  code!: string;

  @ApiProperty({
    example: 'Almacén Central',
    description: 'Nombre de la ubicación',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    enum: LocationTypeDto,
    example: LocationTypeDto.INTERNAL,
    description: 'Tipo de ubicación',
  })
  @IsEnum(LocationTypeDto)
  type!: LocationTypeDto;

  @ApiPropertyOptional({ description: 'ID del contacto asociado' })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({
    type: LocationAddressDto,
    description: 'Dirección de la ubicación',
  })
  @IsOptional()
  address?: LocationAddressDto;
}

export class UpdateLocationDto {
  @ApiPropertyOptional({ example: 'WH-002' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Almacén Secundario' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: LocationTypeDto })
  @IsOptional()
  @IsEnum(LocationTypeDto)
  type?: LocationTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({ type: LocationAddressDto })
  @IsOptional()
  address?: LocationAddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class LocationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: LocationTypeDto })
  type!: string;

  @ApiPropertyOptional()
  contactId!: string | null;

  @ApiPropertyOptional({ type: LocationAddressDto })
  address!: LocationAddressDto | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isTransit!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  updatedAt!: Date | null;
}

export class LocationListResponseDto {
  @ApiProperty({ type: [LocationResponseDto] })
  data!: LocationResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
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

  @ApiPropertyOptional({ enum: LocationTypeDto })
  @IsOptional()
  @IsEnum(LocationTypeDto)
  type?: LocationTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
