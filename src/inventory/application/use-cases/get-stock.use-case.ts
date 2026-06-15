import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INVENTORY_MOVE_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryMoveRepository } from '../../domain/repositories/inventory-move.repository';
import { INVENTORY_LOCATION_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryLocationRepository } from '../../domain/repositories/inventory-location.repository';

export interface GetStockInput {
  businessId: string;
  productId: string;
  variantId?: string;
  locationId?: string;
}

export interface StockInfo {
  productId: string;
  variantId: string | null;
  locationId: string | null;
  locationName: string | null;
  quantity: string;
}

export interface GetStockOutput {
  stocks: StockInfo[];
  total: string;
}

@Injectable()
export class GetStockUseCase {
  constructor(
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepository: InventoryMoveRepository,
    @Inject(INVENTORY_LOCATION_REPOSITORY)
    private readonly locationRepository: InventoryLocationRepository,
  ) {}

  async execute(input: GetStockInput): Promise<GetStockOutput> {
    if (input.locationId) {
      const location = await this.locationRepository.findById(
        input.locationId,
        input.businessId,
      );
      if (!location) {
        throw new NotFoundException('Ubicación no encontrada');
      }

      const quantity = await this.moveRepository.sumQuantity(
        input.productId,
        input.variantId ?? null,
        input.locationId,
        input.businessId,
      );

      return {
        stocks: [
          {
            productId: input.productId,
            variantId: input.variantId ?? null,
            locationId: input.locationId,
            locationName: location.name,
            quantity,
          },
        ],
        total: quantity,
      };
    }

    const { data: locations } = await this.locationRepository.list(
      input.businessId,
      { isActive: true },
    );
    const stocks: StockInfo[] = [];
    let totalQuantity = 0;

    for (const location of locations) {
      const quantity = await this.moveRepository.sumQuantity(
        input.productId,
        input.variantId ?? null,
        location.id,
        input.businessId,
      );

      stocks.push({
        productId: input.productId,
        variantId: input.variantId ?? null,
        locationId: location.id,
        locationName: location.name,
        quantity,
      });

      totalQuantity += parseFloat(quantity);
    }

    return {
      stocks,
      total: totalQuantity.toFixed(6).replace(/\.?0+$/, '0'),
    };
  }
}
