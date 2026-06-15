import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { INVENTORY_LOCATION_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryLocationRepository } from '../../domain/repositories/inventory-location.repository';
import type { LocationType } from '../../domain/entities/inventory-location.entity';

export interface UpdateLocationInput {
  id: string;
  businessId: string;
  code?: string;
  name?: string;
  type?: LocationType;
  contactId?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
  };
  isActive?: boolean;
  updatedBy?: string;
}

export interface UpdateLocationOutput {
  success: boolean;
}

@Injectable()
export class UpdateLocationUseCase {
  private readonly logger = new Logger(UpdateLocationUseCase.name);

  constructor(
    @Inject(INVENTORY_LOCATION_REPOSITORY)
    private readonly locationRepository: InventoryLocationRepository,
  ) {}

  async execute(input: UpdateLocationInput): Promise<UpdateLocationOutput> {
    const location = await this.locationRepository.findById(
      input.id,
      input.businessId,
    );
    if (!location) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    if (input.code && input.code !== location.code) {
      const existing = await this.locationRepository.findByCode(
        input.code,
        input.businessId,
      );
      if (existing) {
        throw new Error('Ya existe una ubicación con este código');
      }
    }

    const updatedLocation = location.update({
      code: input.code,
      name: input.name,
      type: input.type,
      contactId: input.contactId,
      address: input.address,
      updatedBy: input.updatedBy,
    });

    if (input.isActive !== undefined) {
      if (input.isActive) {
        updatedLocation.activate();
      } else {
        updatedLocation.deactivate();
      }
    }

    await this.locationRepository.update(updatedLocation);
    this.logger.log(`Ubicación actualizada: ${input.id}`);

    return { success: true };
  }
}
