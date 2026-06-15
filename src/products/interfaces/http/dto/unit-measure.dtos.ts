import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min } from 'class-validator';

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

  @ApiProperty({ enum: UnitTypeDto, example: UnitTypeDto.WEIGHT, description: 'Tipo de unidad' })
  @IsEnum(UnitTypeDto)
  type!: UnitTypeDto;

  @ApiPropertyOptional({ example: 1000, description: 'Factor de conversión a unidad base' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  conversionFactor?: number;

  @ApiPropertyOptional({ example: false, description: 'Si es la unidad por defecto' })
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
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  abbreviation!: string;

  @ApiProperty()
  type!: UnitTypeDto;

  @ApiProperty()
  conversionFactor!: number;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  updatedAt!: Date | null;
}

export class UnitMeasureListResponseDto {
  @ApiProperty({ type: () => [UnitMeasureResponseDto] })
  data!: UnitMeasureResponseDto[];
}
