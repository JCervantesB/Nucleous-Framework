import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryListResponseDto,
} from './dto/category.dtos';

@ApiTags('Products - Categories')
@ApiBearerAuth()
@ApiExtraModels(CategoryResponseDto, CategoryListResponseDto)
@Controller('product-categories')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear categoría', description: 'Crea una nueva categoría de productos.' })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente', type: () => CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @CurrentBusinessId() businessId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    const result = await this.createCategoryUseCase.execute({
      businessId,
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId,
    });

    return result.category;
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías', description: 'Lista las categorías de productos del negocio.' })
  @ApiResponse({ status: 200, description: 'Lista de categorías', type: () => CategoryListResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async list(
    @CurrentBusinessId() businessId: string,
    @Query('asTree') asTree?: string,
  ) {
    const result = await this.listCategoriesUseCase.execute({
      businessId,
      asTree: asTree === 'true',
    });
    return { data: result.data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría', description: 'Actualiza una categoría existente.' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    await this.updateCategoryUseCase.execute({
      id,
      businessId,
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId,
    });
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar categoría', description: 'Elimina una categoría (solo si no tiene hijos ni productos).' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 400, description: 'Categoría tiene hijos o productos asociados' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
  ) {
    await this.deleteCategoryUseCase.execute({ id, businessId });
    return { success: true };
  }
}
