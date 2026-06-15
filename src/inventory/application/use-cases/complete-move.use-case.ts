import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { INVENTORY_MOVE_REPOSITORY } from '../../domain/inventory.tokens';
import type { InventoryMoveRepository } from '../../domain/repositories/inventory-move.repository';

export interface CompleteMoveInput {
  id: string;
  businessId: string;
  updatedBy?: string;
}

export interface CompleteMoveOutput {
  success: boolean;
}

@Injectable()
export class CompleteMoveUseCase {
  private readonly logger = new Logger(CompleteMoveUseCase.name);

  constructor(
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepository: InventoryMoveRepository,
  ) {}

  async execute(input: CompleteMoveInput): Promise<CompleteMoveOutput> {
    const move = await this.moveRepository.findById(input.id, input.businessId);
    if (!move) {
      throw new NotFoundException('Movimiento no encontrado');
    }

    try {
      const completedMove = move.done();
      await this.moveRepository.update(completedMove);
      this.logger.log(`Movimiento completado: ${input.id}`);
      return { success: true };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al completar',
      );
    }
  }
}
