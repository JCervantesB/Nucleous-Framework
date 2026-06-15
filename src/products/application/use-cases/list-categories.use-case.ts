import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_CATEGORY_REPOSITORY } from '../products.tokens';
import type { ProductCategoryRepository } from '../../domain/repositories/product-category.repository';
import type { ProductCategory } from '../../domain/entities/product-category.entity';

export interface ListCategoriesInput {
  businessId: string;
  asTree?: boolean;
}

export interface ListCategoriesOutput {
  data: ProductCategory[];
}

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly categoryRepo: ProductCategoryRepository,
  ) {}

  async execute(input: ListCategoriesInput): Promise<ListCategoriesOutput> {
    const categories = input.asTree
      ? await this.categoryRepo.listAsTree(input.businessId)
      : await this.categoryRepo.list(input.businessId).then((r) => r.data);

    return { data: categories };
  }
}
