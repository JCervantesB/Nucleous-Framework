import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../products.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';

export interface DeleteProductInput {
  id: string;
  businessId: string;
}

export interface DeleteProductOutput {
  success: boolean;
}

@Injectable()
export class DeleteProductUseCase {
  private readonly logger = new Logger(DeleteProductUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async execute(input: DeleteProductInput): Promise<DeleteProductOutput> {
    const product = await this.productRepo.findById(input.id, input.businessId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    await this.productRepo.delete(input.id, input.businessId);
    this.logger.log(`Producto eliminado lógicamente: ${input.id}`);

    return { success: true };
  }
}
