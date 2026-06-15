import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Camisetas', description: 'Nombre de la categoría' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Categoría de camisetas', description: 'Descripción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-categoria-padre', description: 'ID de categoría padre para jerarquía' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class CategoryResponseDto {
  @ApiProperty({ type: 'string', description: 'ID único de la categoría' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'Nombre de la categoría' })
  name!: string;

  @ApiPropertyOptional({ type: 'string', nullable: true, description: 'Descripción de la categoría' })
  description!: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true, description: 'ID de categoría padre' })
  parentId!: string | null;

  @ApiProperty({ type: 'boolean', description: 'Si está activa' })
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time', description: 'Fecha de creación' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true, description: 'Fecha de actualización' })
  updatedAt!: Date | null;
}

export class CategoryListResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data!: CategoryResponseDto[];
}
