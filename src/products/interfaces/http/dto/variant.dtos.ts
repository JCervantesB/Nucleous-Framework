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
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  priceModifier!: number;

  @ApiProperty()
  attributes!: Record<string, string>;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  updatedAt!: Date | null;
}

export class VariantListResponseDto {
  @ApiProperty({ type: () => [VariantResponseDto] })
  data!: VariantResponseDto[];
}
