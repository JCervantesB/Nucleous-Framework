import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../products.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import type { Product } from '../../domain/entities/product.entity';

export interface GetProductInput {
  id: string;
  businessId: string;
}

export interface GetProductOutput {
  product: Product | null;
}

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async execute(input: GetProductInput): Promise<GetProductOutput> {
    const product = await this.productRepo.findById(input.id, input.businessId);
    return { product };
  }
}
