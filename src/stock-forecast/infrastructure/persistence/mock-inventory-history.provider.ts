import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import type { InventoryHistoryProvider, InventoryHistoryParams } from '../../domain/ports/inventory-history.provider';
import type { InventoryMoveInput } from '../../application/types';

@Injectable()
export class MockInventoryHistoryProvider implements InventoryHistoryProvider {
  async getHistoricalMoves(params: InventoryHistoryParams): Promise<InventoryMoveInput[]> {
    throw new UnprocessableEntityException(
      'InventoryHistoryProvider no está implementado. Configure un provider real o integre con InventoryModule.',
    );
  }
}
