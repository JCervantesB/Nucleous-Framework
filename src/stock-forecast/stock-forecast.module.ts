import { Module, Global, type Provider } from '@nestjs/common';
import { StockForecastController } from './interfaces/http/stock-forecast.controller';
import { ForecastStockUseCase } from './application/use-cases/forecast-stock.use-case';
import { MathStockForecastService } from './infrastructure/math/math-stock-forecast.service';
import { AIStockForecastService } from './infrastructure/ai/ai-stock-forecast.service';
import { MockInventoryHistoryProvider } from './infrastructure/persistence/mock-inventory-history.provider';
import { INVENTORY_HISTORY_PROVIDER } from './application/stock-forecast.tokens';
import type { InventoryHistoryProvider } from './domain/ports/inventory-history.provider';

const INVENTORY_MOVE_REPOSITORY_TOKEN =
  'INVENTORY_MOVE_REPOSITORY' as const;

const isInventoryEnabled = () => {
  const enabled = process.env.ENABLED_MODULES ?? '';
  return enabled.includes('INVENTORY');
};

@Global()
@Module({
  controllers: [StockForecastController],
  providers: [
    {
      provide: INVENTORY_HISTORY_PROVIDER,
      useFactory: async (moveRepo: any) => {
        if (moveRepo) {
          return createInventoryHistoryProviderFromRepo(moveRepo);
        }
        return new MockInventoryHistoryProvider();
      },
      inject: [
        {
          token: INVENTORY_MOVE_REPOSITORY_TOKEN,
          optional: true,
        },
      ],
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
  static withInventoryMoveRepository(
    repository: any,
  ): Provider {
    return {
      provide: INVENTORY_MOVE_REPOSITORY_TOKEN,
      useValue: repository,
    };
  }
}

function createInventoryHistoryProviderFromRepo(
  moveRepo: any,
): InventoryHistoryProvider {
  return {
    async getHistoricalMoves(params: {
      productId: string;
      locationId?: string;
      daysBack?: number;
    }) {
      const daysBack = params.daysBack ?? 90;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - daysBack);

      const moves = await moveRepo.listByProduct(
        params.productId,
        'default-business',
      );

      return moves
        .filter((move: any) => {
          if (move.createdAt < sinceDate) return false;
          if (params.locationId) {
            const matchesLocation =
              move.toLocationId === params.locationId ||
              move.fromLocationId === params.locationId;
            if (!matchesLocation) return false;
          }
          return true;
        })
        .map((move: any) => ({
          date: move.createdAt,
          quantity: parseFloat(move.quantity),
          moveType: move.moveType,
        }));
    },
  };
}
