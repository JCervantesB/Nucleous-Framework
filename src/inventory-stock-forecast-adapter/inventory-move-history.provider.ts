import type { InventoryMoveRepository } from '../inventory/domain/repositories/inventory-move.repository';
import type { InventoryHistoryProvider } from '../stock-forecast/domain/ports/inventory-history.provider';

export function createInventoryHistoryProvider(
  moveRepository: InventoryMoveRepository,
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

      const moves = await moveRepository.listByProduct(
        params.productId,
        'default-business',
      );

      return moves
        .filter((move) => {
          if (move.createdAt < sinceDate) return false;
          if (params.locationId) {
            const matchesLocation =
              move.toLocationId === params.locationId ||
              move.fromLocationId === params.locationId;
            if (!matchesLocation) return false;
          }
          return true;
        })
        .map((move) => ({
          date: move.createdAt,
          quantity: parseFloat(move.quantity),
          moveType: move.moveType,
        }));
    },
  };
}
