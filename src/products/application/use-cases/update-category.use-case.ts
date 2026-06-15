import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_CATEGORY_REPOSITORY } from '../products.tokens';
import type { ProductCategoryRepository } from '../../domain/repositories/product-category.repository';

export interface UpdateCategoryInput {
  id: string;
  businessId: string;
  name?: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateCategoryOutput {
  success: boolean;
}

@Injectable()
export class UpdateCategoryUseCase {
  private readonly logger = new Logger(UpdateCategoryUseCase.name);

  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY) private readonly categoryRepo: ProductCategoryRepository,
  ) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const category = await this.categoryRepo.findById(input.id, input.businessId);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    if (input.parentId !== undefined) {
      if (input.parentId !== null) {
        const parent = await this.categoryRepo.findById(input.parentId, input.businessId);
        if (!parent) {
          throw new Error('Categoría padre no encontrada');
        }
      }
    }

    const updatedCategory = category.update({
      name: input.name,
      description: input.description,
      parentId: input.parentId,
    });

    await this.categoryRepo.update(updatedCategory);
    this.logger.log(`Categoría actualizada: ${input.id}`);

    return { success: true };
  }
}
