import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { INVENTORY_LOCATION_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryLocationRepository } from '../../domain/repositories/inventory-location.repository';
import { InventoryLocation } from '../../domain/entities/inventory-location.entity';
import type { LocationType } from '../../domain/entities/inventory-location.entity';

export interface CreateLocationInput {
  businessId: string;
  code: string;
  name: string;
  type: LocationType;
  contactId?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
  };
  createdBy?: string;
}

@Injectable()
export class CreateLocationUseCase {
  constructor(
    @Inject(INVENTORY_LOCATION_REPOSITORY)
    private readonly locationRepository: InventoryLocationRepository,
  ) {}

  async execute(input: CreateLocationInput): Promise<InventoryLocation> {
    const existing = await this.locationRepository.findByCode(
      input.code,
      input.businessId,
    );
    if (existing) {
      throw new BadRequestException('Ya existe una ubicación con este código');
    }

    const location = InventoryLocation.create({
      businessId: input.businessId,
      code: input.code,
      name: input.name,
      type: input.type,
      contactId: input.contactId,
      address: input.address,
      createdBy: input.createdBy,
    });

    return this.locationRepository.create(location);
  }
}
