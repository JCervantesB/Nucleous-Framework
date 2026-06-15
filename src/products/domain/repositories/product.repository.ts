import type { Product } from '../entities/product.entity';

export interface ProductListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string, businessId: string): Promise<Product | null>;
  findBySku(sku: string, businessId: string): Promise<Product | null>;
  list(businessId: string, options?: ProductListOptions): Promise<{ data: Product[]; total: number }>;
  update(product: Product): Promise<Product>;
  delete(id: string, businessId: string): Promise<void>;
}
