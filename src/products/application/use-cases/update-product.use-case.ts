import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../products.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import type { ProductType } from '../../domain/entities/product.entity';

export interface UpdateProductInput {
  id: string;
  businessId: string;
  name?: string;
  description?: string;
  type?: ProductType;
  categoryId?: string;
  basePrice?: number;
  currencyCode?: string;
  trackInventory?: boolean;
  updatedBy?: string;
}

export interface UpdateProductOutput {
  success: boolean;
}

@Injectable()
export class UpdateProductUseCase {
  private readonly logger = new Logger(UpdateProductUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductOutput> {
    const product = await this.productRepo.findById(input.id, input.businessId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const updatedProduct = product.update({
      name: input.name,
      description: input.description,
      type: input.type,
      categoryId: input.categoryId,
      basePrice: input.basePrice,
      currencyCode: input.currencyCode,
      trackInventory: input.trackInventory,
      updatedBy: input.updatedBy,
    });

    await this.productRepo.update(updatedProduct);
    this.logger.log(`Producto actualizado: ${input.id}`);

    return { success: true };
  }
}
