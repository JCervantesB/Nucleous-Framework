import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ example: 'CAM-001-R-M', description: 'SKU de la variante' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Camiseta Roja Talla M', description: 'Nombre de la variante' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 5.0, description: 'Modificador de precio (se suma al precio base)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceModifier?: number;

  @ApiPropertyOptional({ example: { color: 'rojo', talla: 'M' }, description: 'Atributos de la variante' })
  @IsOptional()
  attributes?: Record<string, string>;
}

export class UpdateVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceModifier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: Record<string, string>;
}

export class VariantResponseDto {
  @ApiProperty({ type: 'string', description: 'ID único de la variante' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'ID del producto padre' })
  productId!: string;

  @ApiProperty({ type: 'string', description: 'SKU de la variante' })
  sku!: string;

  @ApiProperty({ type: 'string', description: 'Nombre de la variante' })
  name!: string;

  @ApiProperty({ type: 'number', description: 'Modificador de precio' })
  priceModifier!: number;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Atributos de la variante' })
  attributes!: Record<string, string>;

  @ApiProperty({ type: 'boolean', description: 'Si está activa' })
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time', description: 'Fecha de creación' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true, description: 'Fecha de actualización' })
  updatedAt!: Date | null;
}

export class VariantListResponseDto {
  @ApiProperty({ type: [VariantResponseDto] })
  data!: VariantResponseDto[];
}
