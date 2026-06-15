import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_VARIANT_REPOSITORY } from '../products.tokens';
import type { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

export interface DeleteVariantInput {
  id: string;
  productId: string;
}

export interface DeleteVariantOutput {
  success: boolean;
}

@Injectable()
export class DeleteVariantUseCase {
  private readonly logger = new Logger(DeleteVariantUseCase.name);

  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY) private readonly variantRepo: ProductVariantRepository,
  ) {}

  async execute(input: DeleteVariantInput): Promise<DeleteVariantOutput> {
    const variant = await this.variantRepo.findById(input.id, input.productId);
    if (!variant) {
      throw new Error('Variante no encontrada');
    }

    await this.variantRepo.delete(input.id, input.productId);
    this.logger.log(`Variante eliminada lógicamente: ${input.id}`);

    return { success: true };
  }
}
