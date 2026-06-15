import type { ProductVariant } from '../entities/product-variant.entity';

export interface ProductVariantRepository {
  create(variant: ProductVariant): Promise<ProductVariant>;
  findById(id: string, productId: string): Promise<ProductVariant | null>;
  findBySku(sku: string, productId: string): Promise<ProductVariant | null>;
  listByProduct(productId: string): Promise<ProductVariant[]>;
  update(variant: ProductVariant): Promise<ProductVariant>;
  delete(id: string, productId: string): Promise<void>;
}
