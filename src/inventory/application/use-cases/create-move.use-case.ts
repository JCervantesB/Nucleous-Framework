import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { INVENTORY_MOVE_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryMoveRepository } from '../../domain/repositories/inventory-move.repository';
import { InventoryMove } from '../../domain/entities/inventory-move.entity';
import { PRODUCT_REPOSITORY } from '../../../products/application/products.tokens';
import type { ProductRepository } from '../../../products/domain/repositories/product.repository';

export interface CreateMoveInput {
  businessId: string;
  productId: string;
  variantId?: string;
  moveType: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT' | 'INTERNAL';
  quantity: string;
  unitOfMeasureId: string;
  fromLocationId?: string;
  toLocationId?: string;
  reference?: string;
  notes?: string;
  externalId?: string;
  originTable?: string;
  originId?: string;
  createdBy?: string;
}

export interface CreateMoveOutput {
  move: InventoryMove;
}

@Injectable()
export class CreateMoveUseCase {
  private readonly logger = new Logger(CreateMoveUseCase.name);

  constructor(
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepository: InventoryMoveRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: CreateMoveInput): Promise<CreateMoveOutput> {
    if (input.externalId) {
      const existing = await this.moveRepository.findByExternalId(
        input.externalId,
        input.businessId,
      );
      if (existing) {
        throw new BadRequestException(
          'Ya existe un movimiento con este identificador externo',
        );
      }
    }

    const product = await this.productRepository.findById(
      input.productId,
      input.businessId,
    );
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.trackInventory && input.moveType !== 'ADJUSTMENT') {
      if (!input.toLocationId && input.moveType === 'INBOUND') {
        throw new BadRequestException(
          'Se requiere ubicación de destino para entrada',
        );
      }
      if (!input.fromLocationId && input.moveType === 'OUTBOUND') {
        throw new BadRequestException(
          'Se requiere ubicación de origen para salida',
        );
      }
      if (!input.toLocationId && input.moveType === 'TRANSFER') {
        throw new BadRequestException(
          'Se requiere ubicación de destino para transferencia',
        );
      }
    }

    const move = InventoryMove.create({
      businessId: input.businessId,
      productId: input.productId,
      variantId: input.variantId,
      moveType: input.moveType,
      quantity: input.quantity,
      unitOfMeasureId: input.unitOfMeasureId,
      fromLocationId: input.fromLocationId,
      toLocationId: input.toLocationId,
      reference: input.reference,
      notes: input.notes,
      externalId: input.externalId,
      originTable: input.originTable,
      originId: input.originId,
      createdBy: input.createdBy,
    });

    const savedMove = await this.moveRepository.create(move);
    this.logger.log(`Movimiento creado: ${savedMove.id} (${input.moveType})`);

    return { move: savedMove };
  }
}
