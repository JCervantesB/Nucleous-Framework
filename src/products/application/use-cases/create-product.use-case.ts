import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../products.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import {
  Product,
  type ProductType,
} from '../../domain/entities/product.entity';

export interface CreateProductInput {
  businessId: string;
  sku: string;
  name: string;
  description?: string;
  type: ProductType;
  categoryId?: string;
  basePrice: number;
  currencyCode?: string;
  trackInventory?: boolean;
  createdBy?: string;
}

export interface CreateProductOutput {
  product: Product;
}

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    const existingProduct = await this.productRepo.findBySku(
      input.sku,
      input.businessId,
    );
    if (existingProduct) {
      throw new Error(`Ya existe un producto con SKU: ${input.sku}`);
    }

    const product = Product.create({
      businessId: input.businessId,
      sku: input.sku,
      name: input.name,
      description: input.description,
      type: input.type,
      categoryId: input.categoryId,
      basePrice: input.basePrice,
      currencyCode: input.currencyCode,
      trackInventory: input.trackInventory,
      createdBy: input.createdBy,
    });

    const savedProduct = await this.productRepo.create(product);
    this.logger.log(`Producto creado: ${savedProduct.id}`);

    return { product: savedProduct };
  }
}
