import { Inject, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import type {
  ForecastInput,
  ForecastResult,
  HistoricalMove,
  InventoryMoveInput,
} from '../types';
import type { StockForecastProvider } from '../../domain/ports/stock-forecast.provider';
import type { InventoryHistoryProvider } from '../../domain/ports/inventory-history.provider';
import {
  INVENTORY_HISTORY_PROVIDER,
} from '../stock-forecast.tokens';
import { AI_MIN_HISTORY_DAYS } from '../../infrastructure/ai/ai-stock-forecast.service';

@Injectable()
export class ForecastStockUseCase {
  private readonly logger = new Logger(ForecastStockUseCase.name);

  constructor(
    @Inject(INVENTORY_HISTORY_PROVIDER)
    private readonly historyProvider: InventoryHistoryProvider,
  ) {}

  async execute(
    input: ForecastInput,
    mathProvider: StockForecastProvider,
    aiProvider: StockForecastProvider | null,
  ): Promise<ForecastResult> {
    const productId = input.productId;
    const locationId = input.locationId;
    const daysAhead = input.daysAhead ?? 30;
    const method = input.method ?? 'AUTO';

    this.logger.log(`Forecast para producto=${productId}, método=${method}`);

    const inventoryMoves = await this.historyProvider.getHistoricalMoves({
      productId,
      locationId,
      daysBack: 90,
    });

    const historicalMoves = this.adaptInventoryMoves(inventoryMoves);

    if (historicalMoves.length === 0) {
      throw new UnprocessableEntityException(
        `No hay movimientos históricos para el producto ${productId}`,
      );
    }

    const forecastParams = {
      productId,
      locationId,
      daysAhead,
      historicalMoves,
    };

    const selectedMethod = this.selectMethod(
      method,
      historicalMoves.length,
      !!aiProvider,
    );

    const provider = selectedMethod === 'AI' ? aiProvider! : mathProvider;

    try {
      const result = await provider.forecast(forecastParams);
      this.logger.log(
        `Forecast completado: método=${result.method}, confidence=${result.confidence}`,
      );
      return result;
    } catch (error) {
      if (selectedMethod === 'AI' && mathProvider) {
        this.logger.warn('IA falló, intentando con método MATH');
        return mathProvider.forecast(forecastParams);
      }
      throw error;
    }
  }

  private adaptInventoryMoves(moves: InventoryMoveInput[]): HistoricalMove[] {
    return moves
      .filter((m) => m.moveType === 'INBOUND' || m.moveType === 'OUTBOUND')
      .map((m) => ({
        date: m.date,
        quantity:
          m.moveType === 'INBOUND'
            ? -Math.abs(m.quantity)
            : Math.abs(m.quantity),
      }));
  }

  private selectMethod(
    requestedMethod: 'AUTO' | 'MATH' | 'AI',
    historyLength: number,
    aiProviderAvailable: boolean,
  ): 'MATH' | 'AI' {
    if (requestedMethod === 'MATH') {
      return 'MATH';
    }

    if (requestedMethod === 'AI' && !aiProviderAvailable) {
      this.logger.warn('AI solicitada pero no disponible, usando MATH');
      return 'MATH';
    }

    if (requestedMethod === 'AI') {
      return 'AI';
    }

    const aiEnabled = process.env.AI_STOCK_FORECAST_ENABLED === 'true';
    if (aiEnabled && aiProviderAvailable && historyLength >= AI_MIN_HISTORY_DAYS) {
      return 'AI';
    }

    return 'MATH';
  }
}
