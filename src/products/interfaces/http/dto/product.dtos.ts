import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';

export enum ProductTypeDto {
  STORABLE = 'storable',
  CONSUMABLE = 'consumable',
  SERVICE = 'service',
}

export class CreateProductDto {
  @ApiProperty({ example: 'CAM-001', description: 'SKU único del producto' })
  @IsString()
  sku!: string;

  @ApiProperty({
    example: 'Camiseta Básica',
    description: 'Nombre del producto',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Camiseta de algodón 100%',
    description: 'Descripción del producto',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ProductTypeDto,
    example: ProductTypeDto.STORABLE,
    description: 'Tipo de producto',
  })
  @IsEnum(ProductTypeDto)
  type!: ProductTypeDto;

  @ApiPropertyOptional({
    example: 'uuid-categoria',
    description: 'ID de categoría',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: 29.99, description: 'Precio base' })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Código de moneda ISO 4217',
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si requiere control de inventario',
  })
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

  @ApiPropertyOptional({
    enum: ['storable', 'consumable', 'service'],
    description: 'Tipo de producto',
  })
  @IsOptional()
  @IsString()
  type?: string;

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
  @ApiProperty({ type: 'string', description: 'ID único del producto' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'SKU del producto' })
  sku!: string;

  @ApiProperty({ type: 'string', description: 'Nombre del producto' })
  name!: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description: 'Descripción del producto',
  })
  description!: string | null;

  @ApiProperty({
    enum: ['storable', 'consumable', 'service'],
    description: 'Tipo de producto',
  })
  type!: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description: 'ID de categoría',
  })
  categoryId!: string | null;

  @ApiProperty({ type: 'number', description: 'Precio base' })
  basePrice!: number;

  @ApiProperty({ type: 'string', description: 'Código de moneda' })
  currencyCode!: string;

  @ApiProperty({ type: 'boolean', description: 'Si está activo' })
  isActive!: boolean;

  @ApiProperty({ type: 'boolean', description: 'Si rastrea inventario' })
  trackInventory!: boolean;

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

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data!: ProductResponseDto[];

  @ApiProperty({ type: 'number', description: 'Total de registros' })
  total!: number;

  @ApiProperty({ type: 'number', description: 'Página actual' })
  page!: number;

  @ApiProperty({ type: 'number', description: 'Elementos por página' })
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

  @ApiPropertyOptional({
    enum: ['storable', 'consumable', 'service'],
    description: 'Tipo de producto',
  })
  @IsOptional()
  @IsString()
  type?: string;
}
