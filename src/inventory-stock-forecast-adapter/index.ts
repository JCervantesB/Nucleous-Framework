import type { INestApplication } from '@nestjs/common';
import { createInventoryHistoryProvider } from './inventory-move-history.provider';
import { INVENTORY_MOVE_REPOSITORY } from '../inventory/domain/inventory.tokens';
import { INVENTORY_HISTORY_PROVIDER } from '../stock-forecast/application/stock-forecast.tokens';

export { createInventoryHistoryProvider };

export function setupInventoryStockForecastIntegration(
  app: INestApplication,
): void {
  const moveRepo = app.get(INVENTORY_MOVE_REPOSITORY);
  const realProvider = createInventoryHistoryProvider(moveRepo);
  (app as any).overrideProvider(INVENTORY_HISTORY_PROVIDER).useValue(realProvider);
}
