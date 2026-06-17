import type { InventoryMoveInput } from '../../application/types';

export interface InventoryHistoryParams {
  productId: string;
  locationId?: string;
  daysBack?: number;
}

export interface InventoryHistoryProvider {
  getHistoricalMoves(params: InventoryHistoryParams): Promise<InventoryMoveInput[]>;
}
