import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_UNIT_MEASURE_REPOSITORY } from '../products.tokens';
import type { ProductUnitMeasureRepository } from '../../domain/repositories/product-unit-measure.repository';
import type { ProductUnitMeasure } from '../../domain/entities/product-unit-measure.entity';

export interface ListUnitMeasuresInput {
  businessId: string;
}

export interface ListUnitMeasuresOutput {
  data: ProductUnitMeasure[];
}

@Injectable()
export class ListUnitMeasuresUseCase {
  constructor(
    @Inject(PRODUCT_UNIT_MEASURE_REPOSITORY) private readonly unitRepo: ProductUnitMeasureRepository,
  ) {}

  async execute(input: ListUnitMeasuresInput): Promise<ListUnitMeasuresOutput> {
    const units = await this.unitRepo.list(input.businessId);
    return { data: units };
  }
}
