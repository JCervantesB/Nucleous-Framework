import type { ProductUnitMeasure } from '../entities/product-unit-measure.entity';

export interface ProductUnitMeasureRepository {
  create(unit: ProductUnitMeasure): Promise<ProductUnitMeasure>;
  findById(id: string, businessId: string): Promise<ProductUnitMeasure | null>;
  list(businessId: string): Promise<ProductUnitMeasure[]>;
  update(unit: ProductUnitMeasure): Promise<ProductUnitMeasure>;
  delete(id: string, businessId: string): Promise<void>;
  getDefault(businessId: string): Promise<ProductUnitMeasure | null>;
}
