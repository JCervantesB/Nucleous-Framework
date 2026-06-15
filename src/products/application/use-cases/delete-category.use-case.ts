import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_CATEGORY_REPOSITORY } from '../products.tokens';
import type { ProductCategoryRepository } from '../../domain/repositories/product-category.repository';

export interface DeleteCategoryInput {
  id: string;
  businessId: string;
}

export interface DeleteCategoryOutput {
  success: boolean;
}

@Injectable()
export class DeleteCategoryUseCase {
  private readonly logger = new Logger(DeleteCategoryUseCase.name);

  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY) private readonly categoryRepo: ProductCategoryRepository,
  ) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const category = await this.categoryRepo.findById(input.id, input.businessId);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    const hasChildren = await this.categoryRepo.hasChildren(input.id);
    if (hasChildren) {
      throw new Error('No se puede eliminar una categoría que tiene subcategorías');
    }

    const hasProducts = await this.categoryRepo.hasProducts(input.id);
    if (hasProducts) {
      throw new Error('No se puede eliminar una categoría que tiene productos');
    }

    await this.categoryRepo.delete(input.id, input.businessId);
    this.logger.log(`Categoría eliminada lógicamente: ${input.id}`);

    return { success: true };
  }
}
