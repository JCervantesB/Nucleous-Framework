import type { Product, ProductProps } from './entities/product.entity.js';
import type { ProductVariant, ProductVariantProps } from './entities/product-variant.entity.js';
import type { ProductCategory, ProductCategoryProps } from './entities/product-category.entity.js';
import type { ProductUnitMeasure, ProductUnitMeasureProps } from './entities/product-unit-measure.entity.js';

export type { Product, ProductProps };
export type { ProductVariant, ProductVariantProps };
export type { ProductCategory, ProductCategoryProps };
export type { ProductUnitMeasure, ProductUnitMeasureProps };

export * from './entities/index.js';
