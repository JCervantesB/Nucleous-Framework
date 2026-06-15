import { Injectable, Inject } from '@nestjs/common';
import { INVENTORY_LOCATION_REPOSITORY } from '../../domain/inventory.tokens';
import type {
  InventoryLocationRepository,
  LocationListOptions,
} from '../../domain/repositories/inventory-location.repository';
import type { InventoryLocation } from '../../domain/entities/inventory-location.entity';

export interface ListLocationsInput {
  businessId: string;
  options?: LocationListOptions;
}

export interface ListLocationsOutput {
  data: InventoryLocation[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ListLocationsUseCase {
  constructor(
    @Inject(INVENTORY_LOCATION_REPOSITORY)
    private readonly locationRepository: InventoryLocationRepository,
  ) {}

  async execute(input: ListLocationsInput): Promise<ListLocationsOutput> {
    const page = input.options?.page ?? 1;
    const pageSize = input.options?.pageSize ?? 20;

    const result = await this.locationRepository.list(
      input.businessId,
      input.options,
    );

    return {
      data: result.data,
      total: result.total,
      page,
      pageSize,
    };
  }
}
