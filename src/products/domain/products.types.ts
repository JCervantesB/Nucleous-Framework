import type { Product, ProductProps } from './entities/product.entity';
import type { ProductVariant, ProductVariantProps } from './entities/product-variant.entity';
import type { ProductCategory, ProductCategoryProps } from './entities/product-category.entity';
import type { ProductUnitMeasure, ProductUnitMeasureProps } from './entities/product-unit-measure.entity';

export type { Product, ProductProps };
export type { ProductVariant, ProductVariantProps };
export type { ProductCategory, ProductCategoryProps };
export type { ProductUnitMeasure, ProductUnitMeasureProps };

export * from './entities/index';
