import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { CreateVariantUseCase } from '../../application/use-cases/create-variant.use-case';
import { UpdateVariantUseCase } from '../../application/use-cases/update-variant.use-case';
import { DeleteVariantUseCase } from '../../application/use-cases/delete-variant.use-case';
import { ListVariantsUseCase } from '../../application/use-cases/list-variants.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import {
  CreateVariantDto,
  UpdateVariantDto,
  VariantResponseDto,
  VariantListResponseDto,
} from './dto/variant.dtos';

@ApiTags('Products - Variants')
@ApiBearerAuth()
@ApiExtraModels(VariantResponseDto, VariantListResponseDto)
@Controller('products/:productId/variants')
export class VariantController {
  constructor(
    private readonly createVariantUseCase: CreateVariantUseCase,
    private readonly updateVariantUseCase: UpdateVariantUseCase,
    private readonly deleteVariantUseCase: DeleteVariantUseCase,
    private readonly listVariantsUseCase: ListVariantsUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear variante',
    description: 'Crea una nueva variante para un producto.',
  })
  @ApiResponse({
    status: 201,
    description: 'Variante creada exitosamente',
    type: () => VariantResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o SKU duplicado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentBusinessId() businessId: string,
    @Body() dto: CreateVariantDto,
  ) {
    const result = await this.createVariantUseCase.execute({
      productId,
      businessId,
      sku: dto.sku,
      name: dto.name,
      priceModifier: dto.priceModifier,
      attributes: dto.attributes,
    });

    return result.variant;
  }

  @Get()
  @ApiOperation({
    summary: 'Listar variantes',
    description: 'Lista todas las variantes de un producto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de variantes',
    type: () => VariantListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async list(@Param('productId', ParseUUIDPipe) productId: string) {
    const result = await this.listVariantsUseCase.execute({ productId });
    return { data: result.data };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar variante',
    description: 'Actualiza una variante existente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Variante actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    await this.updateVariantUseCase.execute({
      id,
      productId,
      name: dto.name,
      priceModifier: dto.priceModifier,
      attributes: dto.attributes,
    });
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar variante',
    description: 'Elimina una variante (eliminación lógica).',
  })
  @ApiResponse({ status: 200, description: 'Variante eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async delete(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteVariantUseCase.execute({ id, productId });
    return { success: true };
  }
}
