import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ForecastStockUseCase } from '../../application/use-cases/forecast-stock.use-case';
import { MathStockForecastService } from '../../infrastructure/math/math-stock-forecast.service';
import { AIStockForecastService } from '../../infrastructure/ai/ai-stock-forecast.service';
import type { ForecastQueryDto, ForecastResponseDto } from './dto/stock-forecast.dtos';

@ApiTags('Stock Forecast', 'Modulo transversal para predicciones de inventario. Proporciona forecasts de stock usando metodos matematicos o IA.')
@Controller('stock-forecast')
export class StockForecastController {
  private readonly logger = new Logger(StockForecastController.name);

  constructor(
    private readonly forecastUseCase: ForecastStockUseCase,
    private readonly mathService: MathStockForecastService,
    private readonly aiService: AIStockForecastService,
  ) {}

  @Get(':productId')
  @ApiOperation({ summary: 'Obtener forecast de stock para un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Forecast calculado exitosamente' })
  @ApiResponse({ status: 422, description: 'No hay datos suficientes o IA no disponible' })
  async getForecast(
    @Param('productId') productId: string,
    @Query() query: ForecastQueryDto,
  ): Promise<ForecastResponseDto> {
    this.logger.log(`Forecast request: productId=${productId}, method=${query.method}`);

    try {
      const result = await this.forecastUseCase.execute(
        {
          productId,
          locationId: query.locationId,
          daysAhead: query.daysAhead ?? 30,
          method: query.method ?? 'AUTO',
        },
        this.mathService,
        this.aiService,
      );

      return this.toResponseDto(result);
    } catch (error) {
      this.logger.error(`Error en forecast: ${error}`);
      throw error;
    }
  }

  private toResponseDto(result: any): ForecastResponseDto {
    return {
      productId: result.productId,
      locationId: result.locationId,
      currentStock: result.currentStock.toFixed(2),
      predictedStock: result.predictedStock.toFixed(2),
      consumptionRate: result.consumptionRate.toFixed(2),
      daysUntilStockout: result.daysUntilStockout,
      confidence: Math.round(result.confidence * 100) / 100,
      method: result.method,
      predictions: result.predictions.map((p: any) => ({
        date: p.date,
        predictedQuantity: p.predictedQuantity.toFixed(2),
        lowerBound: p.lowerBound.toFixed(2),
        upperBound: p.upperBound.toFixed(2),
      })),
    };
  }
}
