import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';

export enum UnitTypeDto {
  UNIT = 'unit',
  WEIGHT = 'weight',
  VOLUME = 'volume',
  LENGTH = 'length',
  AREA = 'area',
}

export class CreateUnitMeasureDto {
  @ApiProperty({ example: 'Kilogramo', description: 'Nombre de la unidad' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'kg', description: 'Abreviatura' })
  @IsString()
  abbreviation!: string;

  @ApiProperty({
    enum: UnitTypeDto,
    example: UnitTypeDto.WEIGHT,
    description: 'Tipo de unidad',
  })
  @IsEnum(UnitTypeDto)
  type!: UnitTypeDto;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Factor de conversión a unidad base',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  conversionFactor?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Si es la unidad por defecto',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateUnitMeasureDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  abbreviation?: string;

  @ApiPropertyOptional({ enum: UnitTypeDto })
  @IsOptional()
  @IsEnum(UnitTypeDto)
  type?: UnitTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  conversionFactor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UnitMeasureResponseDto {
  @ApiProperty({ type: 'string', description: 'ID único de la unidad' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'Nombre de la unidad' })
  name!: string;

  @ApiProperty({ type: 'string', description: 'Abreviatura' })
  abbreviation!: string;

  @ApiProperty({
    enum: ['weight', 'volume', 'length', 'area', 'quantity'],
    description: 'Tipo de unidad',
  })
  type!: string;

  @ApiProperty({ type: 'number', description: 'Factor de conversión' })
  conversionFactor!: number;

  @ApiProperty({ type: 'boolean', description: 'Si es la unidad por defecto' })
  isDefault!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Fecha de actualización',
  })
  updatedAt!: Date | null;
}

export class UnitMeasureListResponseDto {
  @ApiProperty({ type: [UnitMeasureResponseDto] })
  data!: UnitMeasureResponseDto[];
}
