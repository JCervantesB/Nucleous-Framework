import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { INVENTORY_MOVE_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryMoveRepository } from '../../domain/repositories/inventory-move.repository';
import { INVENTORY_LOCATION_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryLocationRepository } from '../../domain/repositories/inventory-location.repository';
import { InventoryMove } from '../../domain/entities/inventory-move.entity';
import { AddRecordEventUseCase } from '../../../core/domain/record-event/use-cases/add-record-event.use-case';

export interface AdjustInventoryInput {
  businessId: string;
  productId: string;
  variantId?: string;
  locationId: string;
  quantity: string;
  unitOfMeasureId: string;
  reason: string;
  notes?: string;
  userId?: string;
}

export interface AdjustInventoryOutput {
  success: boolean;
  moveId: string;
}

@Injectable()
export class AdjustInventoryUseCase {
  private readonly logger = new Logger(AdjustInventoryUseCase.name);

  constructor(
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepository: InventoryMoveRepository,
    @Inject(INVENTORY_LOCATION_REPOSITORY)
    private readonly locationRepository: InventoryLocationRepository,
    private readonly addRecordEvent: AddRecordEventUseCase,
  ) {}

  async execute(input: AdjustInventoryInput): Promise<AdjustInventoryOutput> {
    const location = await this.locationRepository.findById(
      input.locationId,
      input.businessId,
    );
    if (!location) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    const currentStock = await this.moveRepository.sumQuantity(
      input.productId,
      input.variantId ?? null,
      input.locationId,
      input.businessId,
    );

    const adjustmentMove = InventoryMove.create({
      businessId: input.businessId,
      productId: input.productId,
      variantId: input.variantId,
      moveType: 'ADJUSTMENT',
      quantity: input.quantity,
      unitOfMeasureId: input.unitOfMeasureId,
      toLocationId: input.locationId,
      notes: input.notes ?? input.reason,
      createdBy: input.userId,
    });

    const savedMove = await this.moveRepository.create(adjustmentMove);

    const confirmedMove = savedMove.confirm();
    await this.moveRepository.update(confirmedMove);

    const completedMove = confirmedMove.done();
    await this.moveRepository.update(completedMove);

    await this.addRecordEvent.execute({
      businessId: input.businessId,
      userId: input.userId,
      relatedTable: 'inventory_move',
      relatedId: savedMove.id,
      type: 'INVENTORY_ADJUSTMENT',
      message: `Ajuste de inventario: ${input.reason}. Stock anterior: ${currentStock}, nuevo stock: ${input.quantity}`,
    });

    this.logger.log(`Ajuste de inventario realizado: ${savedMove.id}`);

    return {
      success: true,
      moveId: savedMove.id,
    };
  }
}
