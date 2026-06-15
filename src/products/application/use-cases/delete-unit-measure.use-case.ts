import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_UNIT_MEASURE_REPOSITORY } from '../products.tokens';
import type { ProductUnitMeasureRepository } from '../../domain/repositories/product-unit-measure.repository';

export interface DeleteUnitMeasureInput {
  id: string;
  businessId: string;
}

export interface DeleteUnitMeasureOutput {
  success: boolean;
}

@Injectable()
export class DeleteUnitMeasureUseCase {
  private readonly logger = new Logger(DeleteUnitMeasureUseCase.name);

  constructor(
    @Inject(PRODUCT_UNIT_MEASURE_REPOSITORY) private readonly unitRepo: ProductUnitMeasureRepository,
  ) {}

  async execute(input: DeleteUnitMeasureInput): Promise<DeleteUnitMeasureOutput> {
    const unit = await this.unitRepo.findById(input.id, input.businessId);
    if (!unit) {
      throw new Error('Unidad de medida no encontrada');
    }

    await this.unitRepo.delete(input.id, input.businessId);
    this.logger.log(`Unidad de medida eliminada: ${input.id}`);

    return { success: true };
  }
}
