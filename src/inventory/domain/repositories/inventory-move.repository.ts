import type { InventoryMove } from '../entities/inventory-move.entity';
import type { MoveType, MoveState } from '../entities/inventory-move.entity';

export interface MoveListOptions {
  page?: number;
  pageSize?: number;
  productId?: string;
  variantId?: string;
  moveType?: MoveType;
  state?: MoveState;
  fromLocationId?: string;
  toLocationId?: string;
  reference?: string;
}

export interface InventoryMoveRepository {
  create(move: InventoryMove): Promise<InventoryMove>;
  findById(id: string, businessId: string): Promise<InventoryMove | null>;
  findByExternalId(
    externalId: string,
    businessId: string,
  ): Promise<InventoryMove | null>;
  list(
    businessId: string,
    options?: MoveListOptions,
  ): Promise<{ data: InventoryMove[]; total: number }>;
  listByProduct(
    productId: string,
    businessId: string,
  ): Promise<InventoryMove[]>;
  update(move: InventoryMove): Promise<InventoryMove>;
  delete(id: string, businessId: string): Promise<void>;
  sumQuantity(
    productId: string,
    variantId: string | null,
    locationId: string,
    businessId: string,
  ): Promise<string>;
}
