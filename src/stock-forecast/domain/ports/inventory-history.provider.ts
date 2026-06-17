import type { InventoryMove } from '../../../inventory/domain/entities/inventory-move.entity';

export interface InventoryHistoryParams {
  productId: string;
  locationId?: string;
  daysBack?: number;
}

export interface InventoryHistoryProvider {
  getHistoricalMoves(params: InventoryHistoryParams): Promise<InventoryMove[]>;
}
