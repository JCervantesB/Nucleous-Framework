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
} from '@nestjs/swagger';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductListResponseDto,
  ListProductsQueryDto,
} from './dto/product.dtos';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear producto', description: 'Crea un nuevo producto en el catálogo del negocio.' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente', type: () => ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos o SKU duplicado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @CurrentBusinessId() businessId: string,
    @Body() dto: CreateProductDto,
  ) {
    const result = await this.createProductUseCase.execute({
      businessId,
      sku: dto.sku,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      categoryId: dto.categoryId,
      basePrice: dto.basePrice,
      currencyCode: dto.currencyCode,
      trackInventory: dto.trackInventory,
    });

    return result.product;
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos', description: 'Lista productos del negocio con paginación y filtros.' })
  @ApiResponse({ status: 200, description: 'Lista de productos', type: () => ProductListResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async list(
    @CurrentBusinessId() businessId: string,
    @Query() query: ListProductsQueryDto,
  ) {
    const result = await this.listProductsUseCase.execute({
      businessId,
      options: {
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
      },
    });

    return {
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto', description: 'Obtiene un producto por su ID.' })
  @ApiResponse({ status: 200, description: 'Producto encontrado', type: () => ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
  ) {
    const result = await this.getProductUseCase.execute({ id, businessId });
    if (!result.product) {
      throw new Error('Producto no encontrado');
    }
    return result.product;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto', description: 'Actualiza los datos de un producto existente.' })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
    @Body() dto: UpdateProductDto,
  ) {
    await this.updateProductUseCase.execute({
      id,
      businessId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      categoryId: dto.categoryId,
      basePrice: dto.basePrice,
      currencyCode: dto.currencyCode,
      trackInventory: dto.trackInventory,
    });

    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar producto', description: 'Elimina lógicamente un producto (lo desactiva).' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
  ) {
    await this.deleteProductUseCase.execute({ id, businessId });
    return { success: true };
  }
}
