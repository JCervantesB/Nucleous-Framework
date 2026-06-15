import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_UNIT_MEASURE_REPOSITORY } from '../products.tokens';
import type { ProductUnitMeasureRepository } from '../../domain/repositories/product-unit-measure.repository';
import type { UnitType } from '../../domain/entities/product-unit-measure.entity';

export interface UpdateUnitMeasureInput {
  id: string;
  businessId: string;
  name?: string;
  abbreviation?: string;
  type?: UnitType;
  conversionFactor?: number;
  isDefault?: boolean;
}

export interface UpdateUnitMeasureOutput {
  success: boolean;
}

@Injectable()
export class UpdateUnitMeasureUseCase {
  private readonly logger = new Logger(UpdateUnitMeasureUseCase.name);

  constructor(
    @Inject(PRODUCT_UNIT_MEASURE_REPOSITORY) private readonly unitRepo: ProductUnitMeasureRepository,
  ) {}

  async execute(input: UpdateUnitMeasureInput): Promise<UpdateUnitMeasureOutput> {
    const unit = await this.unitRepo.findById(input.id, input.businessId);
    if (!unit) {
      throw new Error('Unidad de medida no encontrada');
    }

    const updatedUnit = unit.update({
      name: input.name,
      abbreviation: input.abbreviation,
      type: input.type,
      conversionFactor: input.conversionFactor,
      isDefault: input.isDefault,
    });

    await this.unitRepo.update(updatedUnit);
    this.logger.log(`Unidad de medida actualizada: ${input.id}`);

    return { success: true };
  }
}
