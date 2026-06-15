import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../products.tokens';
import type {
  ProductRepository,
  ProductListOptions,
} from '../../domain/repositories/product.repository';
import type { Product } from '../../domain/entities/product.entity';

export interface ListProductsInput {
  businessId: string;
  options?: ProductListOptions;
}

export interface ListProductsOutput {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async execute(input: ListProductsInput): Promise<ListProductsOutput> {
    const page = input.options?.page ?? 1;
    const pageSize = input.options?.pageSize ?? 20;

    const result = await this.productRepo.list(input.businessId, input.options);

    return {
      data: result.data,
      total: result.total,
      page,
      pageSize,
    };
  }
}
