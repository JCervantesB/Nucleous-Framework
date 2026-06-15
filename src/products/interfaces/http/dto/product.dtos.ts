import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min } from 'class-validator';

export enum ProductTypeDto {
  STORABLE = 'storable',
  CONSUMABLE = 'consumable',
  SERVICE = 'service',
}

export class CreateProductDto {
  @ApiProperty({ example: 'CAM-001', description: 'SKU único del producto' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Camiseta Básica', description: 'Nombre del producto' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Camiseta de algodón 100%', description: 'Descripción del producto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductTypeDto, example: ProductTypeDto.STORABLE, description: 'Tipo de producto' })
  @IsEnum(ProductTypeDto)
  type!: ProductTypeDto;

  @ApiPropertyOptional({ example: 'uuid-categoria', description: 'ID de categoría' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: 29.99, description: 'Precio base' })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Código de moneda ISO 4217' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({ example: true, description: 'Si requiere control de inventario' })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Camiseta Premium' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProductTypeDto })
  @IsOptional()
  @IsEnum(ProductTypeDto)
  type?: ProductTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;
}

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty()
  type!: ProductTypeDto;

  @ApiPropertyOptional()
  categoryId!: string | null;

  @ApiProperty()
  basePrice!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  trackInventory!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  updatedAt!: Date | null;
}

export class ProductListResponseDto {
  @ApiProperty({ type: () => [ProductResponseDto] })
  data!: ProductResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}

export class ListProductsQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ProductTypeDto })
  @IsOptional()
  @IsEnum(ProductTypeDto)
  type?: ProductTypeDto;
}
