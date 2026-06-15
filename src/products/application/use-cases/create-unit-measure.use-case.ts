import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_UNIT_MEASURE_REPOSITORY } from '../products.tokens';
import type { ProductUnitMeasureRepository } from '../../domain/repositories/product-unit-measure.repository';
import type { UnitType } from '../../domain/entities/product-unit-measure.entity';
import { ProductUnitMeasure } from '../../domain/entities/product-unit-measure.entity';

export interface CreateUnitMeasureInput {
  businessId: string;
  name: string;
  abbreviation: string;
  type: UnitType;
  conversionFactor?: number;
  isDefault?: boolean;
}

export interface CreateUnitMeasureOutput {
  unitMeasure: { id: string; name: string; abbreviation: string };
}

@Injectable()
export class CreateUnitMeasureUseCase {
  private readonly logger = new Logger(CreateUnitMeasureUseCase.name);

  constructor(
    @Inject(PRODUCT_UNIT_MEASURE_REPOSITORY)
    private readonly unitRepo: ProductUnitMeasureRepository,
  ) {}

  async execute(
    input: CreateUnitMeasureInput,
  ): Promise<CreateUnitMeasureOutput> {
    const unit = ProductUnitMeasure.create({
      businessId: input.businessId,
      name: input.name,
      abbreviation: input.abbreviation,
      type: input.type,
      conversionFactor: input.conversionFactor,
      isDefault: input.isDefault,
    });

    const saved = await this.unitRepo.create(unit);
    this.logger.log(`Unidad de medida creada: ${saved.id}`);

    return {
      unitMeasure: {
        id: saved.id,
        name: saved.name,
        abbreviation: saved.abbreviation,
      },
    };
  }
}
