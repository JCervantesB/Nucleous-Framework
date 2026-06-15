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
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiPropertyOptional()
  parentId!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  updatedAt!: Date | null;
}

export class CategoryListResponseDto {
  @ApiProperty({ type: () => [CategoryResponseDto] })
  data!: CategoryResponseDto[];
}
