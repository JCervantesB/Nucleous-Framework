import { Injectable, Inject } from '@nestjs/common';
import { INVENTORY_MOVE_REPOSITORY } from '../../domain/inventory.tokens';
import type {
  InventoryMoveRepository,
  MoveListOptions,
} from '../../domain/repositories/inventory-move.repository';
import type { InventoryMove } from '../../domain/entities/inventory-move.entity';

export interface ListMovesInput {
  businessId: string;
  options?: MoveListOptions;
}

export interface ListMovesOutput {
  data: InventoryMove[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ListMovesUseCase {
  constructor(
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepository: InventoryMoveRepository,
  ) {}

  async execute(input: ListMovesInput): Promise<ListMovesOutput> {
    const page = input.options?.page ?? 1;
    const pageSize = input.options?.pageSize ?? 20;

    const result = await this.moveRepository.list(
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
