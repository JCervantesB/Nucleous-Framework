import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_VARIANT_REPOSITORY } from '../products.tokens';
import type { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

export interface UpdateVariantInput {
  id: string;
  productId: string;
  name?: string;
  priceModifier?: number;
  attributes?: Record<string, string>;
}

export interface UpdateVariantOutput {
  success: boolean;
}

@Injectable()
export class UpdateVariantUseCase {
  private readonly logger = new Logger(UpdateVariantUseCase.name);

  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepo: ProductVariantRepository,
  ) {}

  async execute(input: UpdateVariantInput): Promise<UpdateVariantOutput> {
    const variant = await this.variantRepo.findById(input.id, input.productId);
    if (!variant) {
      throw new Error('Variante no encontrada');
    }

    const updatedVariant = variant.update({
      name: input.name,
      priceModifier: input.priceModifier,
      attributes: input.attributes,
    });

    await this.variantRepo.update(updatedVariant);
    this.logger.log(`Variante actualizada: ${input.id}`);

    return { success: true };
  }
}
