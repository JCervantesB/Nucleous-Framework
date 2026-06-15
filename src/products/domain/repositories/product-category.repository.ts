import type { ProductCategory } from '../entities/product-category.entity.js';

export interface ProductCategoryListOptions {
  page?: number;
  pageSize?: number;
}

export interface ProductCategoryRepository {
  create(category: ProductCategory): Promise<ProductCategory>;
  findById(id: string, businessId: string): Promise<ProductCategory | null>;
  list(businessId: string, options?: ProductCategoryListOptions): Promise<{ data: ProductCategory[]; total: number }>;
  listAsTree(businessId: string): Promise<ProductCategory[]>;
  update(category: ProductCategory): Promise<ProductCategory>;
  delete(id: string, businessId: string): Promise<void>;
  hasChildren(id: string): Promise<boolean>;
  hasProducts(id: string): Promise<boolean>;
}
