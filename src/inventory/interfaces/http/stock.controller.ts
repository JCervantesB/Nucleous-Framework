import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { GetStockUseCase } from '../../application/use-cases/get-stock.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import { GetStockQueryDto, StockResponseDto } from './dto/stock.dtos';

@ApiTags('Inventory Stock')
@ApiBearerAuth()
@ApiExtraModels(StockResponseDto)
@Controller('inventory/stock')
export class StockController {
  constructor(private readonly getStockUseCase: GetStockUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar stock',
    description:
      'Retorna el stock de un producto por ubicación. Si no se especifica ubicación, retorna todas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock del producto',
    type: () => StockResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ubicación no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getStock(
    @CurrentBusinessId() businessId: string,
    @Query() query: GetStockQueryDto,
  ) {
    const result = await this.getStockUseCase.execute({
      businessId,
      productId: query.productId,
      variantId: query.variantId,
      locationId: query.locationId,
    });

    return result;
  }
}
