import { Module, Global, type Provider } from '@nestjs/common';
import { StockForecastController } from './interfaces/http/stock-forecast.controller';
import { ForecastStockUseCase } from './application/use-cases/forecast-stock.use-case';
import { MathStockForecastService } from './infrastructure/math/math-stock-forecast.service';
import { AIStockForecastService } from './infrastructure/ai/ai-stock-forecast.service';
import { MockInventoryHistoryProvider } from './infrastructure/persistence/mock-inventory-history.provider';
import { INVENTORY_HISTORY_PROVIDER } from './application/stock-forecast.tokens';
import type { InventoryHistoryProvider } from './domain/ports/inventory-history.provider';

@Global()
@Module({
  controllers: [StockForecastController],
  providers: [
    {
      provide: INVENTORY_HISTORY_PROVIDER,
      useClass: MockInventoryHistoryProvider,
    },
    ForecastStockUseCase,
    MathStockForecastService,
    AIStockForecastService,
  ],
  exports: [
    INVENTORY_HISTORY_PROVIDER,
    ForecastStockUseCase,
    MathStockForecastService,
    AIStockForecastService,
  ],
})
export class StockForecastModule {
  static withInventoryHistoryProvider(
    provider: InventoryHistoryProvider,
  ): Provider {
    return {
      provide: INVENTORY_HISTORY_PROVIDER,
      useValue: provider,
    };
  }

  static forRoot() {
    return {
      module: StockForecastModule,
      imports: [],
      controllers: [StockForecastController],
      providers: [
        ForecastStockUseCase,
        MathStockForecastService,
        AIStockForecastService,
      ],
      exports: [
        ForecastStockUseCase,
        MathStockForecastService,
        AIStockForecastService,
      ],
    };
  }
}
