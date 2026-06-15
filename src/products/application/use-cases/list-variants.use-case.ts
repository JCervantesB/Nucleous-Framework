import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_VARIANT_REPOSITORY } from '../products.tokens';
import type { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';
import type { ProductVariant } from '../../domain/entities/product-variant.entity';

export interface ListVariantsInput {
  productId: string;
}

export interface ListVariantsOutput {
  data: ProductVariant[];
}

@Injectable()
export class ListVariantsUseCase {
  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepo: ProductVariantRepository,
  ) {}

  async execute(input: ListVariantsInput): Promise<ListVariantsOutput> {
    const variants = await this.variantRepo.listByProduct(input.productId);
    return { data: variants };
  }
}
