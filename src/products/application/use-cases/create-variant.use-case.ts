import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  PRODUCT_VARIANT_REPOSITORY,
} from '../products.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import type { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';
import { ProductVariant } from '../../domain/entities/product-variant.entity';

export interface CreateVariantInput {
  productId: string;
  businessId: string;
  sku: string;
  name: string;
  priceModifier?: number;
  attributes?: Record<string, string>;
}

export interface CreateVariantOutput {
  variant: ProductVariant;
}

@Injectable()
export class CreateVariantUseCase {
  private readonly logger = new Logger(CreateVariantUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepo: ProductVariantRepository,
  ) {}

  async execute(input: CreateVariantInput): Promise<CreateVariantOutput> {
    const product = await this.productRepo.findById(
      input.productId,
      input.businessId,
    );
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const existingVariant = await this.variantRepo.findBySku(
      input.sku,
      input.productId,
    );
    if (existingVariant) {
      throw new Error(`Ya existe una variante con SKU: ${input.sku}`);
    }

    const variant = ProductVariant.create({
      productId: input.productId,
      sku: input.sku,
      name: input.name,
      priceModifier: input.priceModifier,
      attributes: input.attributes,
    });

    const savedVariant = await this.variantRepo.create(variant);
    this.logger.log(`Variante creada: ${savedVariant.id}`);

    return { variant: savedVariant };
  }
}
