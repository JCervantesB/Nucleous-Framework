import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { INVENTORY_MOVE_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryMoveRepository } from '../../domain/repositories/inventory-move.repository';

export interface ConfirmMoveInput {
  id: string;
  businessId: string;
  updatedBy?: string;
}

export interface ConfirmMoveOutput {
  success: boolean;
}

@Injectable()
export class ConfirmMoveUseCase {
  private readonly logger = new Logger(ConfirmMoveUseCase.name);

  constructor(
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepository: InventoryMoveRepository,
  ) {}

  async execute(input: ConfirmMoveInput): Promise<ConfirmMoveOutput> {
    const move = await this.moveRepository.findById(input.id, input.businessId);
    if (!move) {
      throw new NotFoundException('Movimiento no encontrado');
    }

    try {
      const confirmedMove = move.confirm();
      await this.moveRepository.update(confirmedMove);
      this.logger.log(`Movimiento confirmado: ${input.id}`);
      return { success: true };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al confirmar',
      );
    }
  }
}
