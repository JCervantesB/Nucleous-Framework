import { Module, Global } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  PRODUCT_VARIANT_REPOSITORY,
  PRODUCT_CATEGORY_REPOSITORY,
  PRODUCT_UNIT_MEASURE_REPOSITORY,
} from './application/products.tokens';
import { DrizzleProductRepository } from './infrastructure/persistence/drizzle-product.repository';
import { DrizzleProductVariantRepository } from './infrastructure/persistence/drizzle-product-variant.repository';
import { DrizzleProductCategoryRepository } from './infrastructure/persistence/drizzle-product-category.repository';
import { DrizzleProductUnitMeasureRepository } from './infrastructure/persistence/drizzle-product-unit-measure.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { CreateVariantUseCase } from './application/use-cases/create-variant.use-case';
import { UpdateVariantUseCase } from './application/use-cases/update-variant.use-case';
import { DeleteVariantUseCase } from './application/use-cases/delete-variant.use-case';
import { ListVariantsUseCase } from './application/use-cases/list-variants.use-case';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { CreateUnitMeasureUseCase } from './application/use-cases/create-unit-measure.use-case';
import { UpdateUnitMeasureUseCase } from './application/use-cases/update-unit-measure.use-case';
import { DeleteUnitMeasureUseCase } from './application/use-cases/delete-unit-measure.use-case';
import { ListUnitMeasuresUseCase } from './application/use-cases/list-unit-measures.use-case';
import { ProductController } from './interfaces/http/product.controller';
import { VariantController } from './interfaces/http/variant.controller';
import { CategoryController } from './interfaces/http/category.controller';
import { UnitMeasureController } from './interfaces/http/unit-measure.controller';

@Global()
@Module({
  controllers: [
    ProductController,
    VariantController,
    CategoryController,
    UnitMeasureController,
  ],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: DrizzleProductRepository,
    },
    {
      provide: PRODUCT_VARIANT_REPOSITORY,
      useClass: DrizzleProductVariantRepository,
    },
    {
      provide: PRODUCT_CATEGORY_REPOSITORY,
      useClass: DrizzleProductCategoryRepository,
    },
    {
      provide: PRODUCT_UNIT_MEASURE_REPOSITORY,
      useClass: DrizzleProductUnitMeasureRepository,
    },
    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    DeleteProductUseCase,
    CreateVariantUseCase,
    UpdateVariantUseCase,
    DeleteVariantUseCase,
    ListVariantsUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    ListCategoriesUseCase,
    CreateUnitMeasureUseCase,
    UpdateUnitMeasureUseCase,
    DeleteUnitMeasureUseCase,
    ListUnitMeasuresUseCase,
  ],
  exports: [
    PRODUCT_REPOSITORY,
    PRODUCT_VARIANT_REPOSITORY,
    PRODUCT_CATEGORY_REPOSITORY,
    PRODUCT_UNIT_MEASURE_REPOSITORY,
    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    DeleteProductUseCase,
    CreateVariantUseCase,
    UpdateVariantUseCase,
    DeleteVariantUseCase,
    ListVariantsUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    ListCategoriesUseCase,
    CreateUnitMeasureUseCase,
    UpdateUnitMeasureUseCase,
    DeleteUnitMeasureUseCase,
    ListUnitMeasuresUseCase,
  ],
})
export class ProductsModule {}
