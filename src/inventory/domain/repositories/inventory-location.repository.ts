import type { InventoryLocation } from '../entities/inventory-location.entity';
import type { LocationType } from '../entities/inventory-location.entity';

export interface LocationListOptions {
  page?: number;
  pageSize?: number;
  type?: LocationType;
  isActive?: boolean;
  search?: string;
}

export interface InventoryLocationRepository {
  create(location: InventoryLocation): Promise<InventoryLocation>;
  findById(id: string, businessId: string): Promise<InventoryLocation | null>;
  findByCode(
    code: string,
    businessId: string,
  ): Promise<InventoryLocation | null>;
  list(
    businessId: string,
    options?: LocationListOptions,
  ): Promise<{ data: InventoryLocation[]; total: number }>;
  update(location: InventoryLocation): Promise<InventoryLocation>;
  delete(id: string, businessId: string): Promise<void>;
}
