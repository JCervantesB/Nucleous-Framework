import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_CATEGORY_REPOSITORY } from '../products.tokens';
import type { ProductCategoryRepository } from '../../domain/repositories/product-category.repository';
import { ProductCategory } from '../../domain/entities/product-category.entity';

export interface CreateCategoryInput {
  businessId: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface CreateCategoryOutput {
  category: ProductCategory;
}

@Injectable()
export class CreateCategoryUseCase {
  private readonly logger = new Logger(CreateCategoryUseCase.name);

  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly categoryRepo: ProductCategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    if (input.parentId) {
      const parent = await this.categoryRepo.findById(
        input.parentId,
        input.businessId,
      );
      if (!parent) {
        throw new Error('Categoría padre no encontrada');
      }
    }

    const category = ProductCategory.create({
      businessId: input.businessId,
      name: input.name,
      description: input.description,
      parentId: input.parentId,
    });

    const savedCategory = await this.categoryRepo.create(category);
    this.logger.log(`Categoría creada: ${savedCategory.id}`);

    return { category: savedCategory };
  }
}
