# Visión General del Módulo de Productos (ProductsModule)

## Arquitectura

El `ProductsModule` es un **módulo global** de NestJS que gestiona el catálogo de productos de un negocio. Permite definir productos con sus variantes, tipos, categorías y unidades de medida.

```
src/products/
├── domain/                         # Entidades y contratos (puro)
│   ├── entities/
│   │   ├── product.entity.ts       # Producto principal
│   │   ├── product-variant.entity.ts # Variantes (tallas, colores)
│   │   ├── product-category.entity.ts # Categorías jerárquicas
│   │   ├── product-unit-measure.entity.ts # Unidades de medida
│   │   └── index.ts
│   ├── repositories/               # Interfaces de repositorio
│   │   ├── product.repository.ts
│   │   ├── product-variant.repository.ts
│   │   ├── product-category.repository.ts
│   │   └── product-unit-measure.repository.ts
│   └── products.types.ts
├── application/                    # Casos de uso
│   ├── products.tokens.ts          # Símbolos de inyección
│   └── use-cases/
│       ├── create-product.use-case.ts
│       ├── update-product.use-case.ts
│       ├── get-product.use-case.ts
│       ├── list-products.use-case.ts
│       ├── delete-product.use-case.ts
│       ├── create-variant.use-case.ts
│       ├── list-variants.use-case.ts
│       └── ... (15 use cases total)
├── infrastructure/                 # Implementaciones externas
│   └── persistence/
│       ├── drizzle-product.repository.ts
│       ├── drizzle-product-variant.repository.ts
│       ├── drizzle-product-category.repository.ts
│       └── drizzle-product-unit-measure.repository.ts
├── interfaces/http/                # Controladores REST
│   ├── product.controller.ts
│   ├── variant.controller.ts
│   ├── category.controller.ts
│   ├── unit-measure.controller.ts
│   └── dto/
│       ├── product.dtos.ts
│       ├── variant.dtos.ts
│       ├── category.dtos.ts
│       └── unit-measure.dtos.ts
└── products.module.ts              # Módulo global
```

## Principios de Diseño

### 1. Módulo Global con Exports Completos

El módulo es `@Global()`, lo que significa que todos sus providers están disponibles en toda la aplicación sin imports adicionales:

```typescript
@Global()
@Module({
  providers: [/* ... */],
  exports: [
    PRODUCT_REPOSITORY,
    PRODUCT_VARIANT_REPOSITORY,
    PRODUCT_CATEGORY_REPOSITORY,
    PRODUCT_UNIT_MEASURE_REPOSITORY,
    CreateProductUseCase,
    ListProductsUseCase,
    // ... todos los use cases
  ],
})
export class ProductsModule {}
```

### 2. Eliminación Lógica

Los productos, categorías y unidades **no se eliminan físicamente**. Se marca `isActive = false`:

```typescript
async delete(id: string, businessId: string): Promise<void> {
  const product = await this.findById(id, businessId);
  product.deactivate();
  await this.update(product);
}
```

### 3. SKU Único por Negocio

El SKU es único dentro de un negocio (`businessId`), pero puede repetirse entre negocios:

```typescript
const existing = await this.productRepo.findBySku(sku, businessId);
if (existing) {
  throw new Error(`Ya existe un producto con SKU: ${sku}`);
}
```

## Modelo de Dominio

### Entidades Principales

```
┌─────────────────┐       ┌─────────────────┐
│    Product      │───────│  ProductCategory│
└────────┬────────┘       └─────────────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────────┐ ┌─────────────────┐
│ ProductVariant  │ │ProductUnitMeasure│
└─────────────────┘ └─────────────────┘
```

### Product

```typescript
export type ProductType = 'storable' | 'consumable' | 'service';

interface ProductProps {
  id: string;
  businessId: string;
  sku: string;                    // Único por negocio
  name: string;
  description: string | null;
  type: ProductType;              // storable | consumable | service
  categoryId: string | null;
  basePrice: number;
  currencyCode: string;           // ISO 4217 (USD, EUR, etc.)
  isActive: boolean;
  trackInventory: boolean;        // Solo para storable/consumable
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}
```

**Tipos de Producto:**
| Tipo | Descripción | Control de Inventario |
|------|-------------|------------------------|
| `storable` | Producto almacenable (ej: ropa, electrónica) | Sí |
| `consumable` | Producto consumible (ej: comida, tinta) | Sí |
| `service` | Servicio (ej: envío, instalación) | No |

### ProductVariant

```typescript
interface ProductVariantProps {
  id: string;
  productId: string;
  sku: string;                    // Único dentro del producto
  name: string;                  // ej: "Camiseta Roja Talla M"
  priceModifier: number;         // Se suma al basePrice
  attributes: Record<string, string>; // { "color": "rojo", "talla": "M" }
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
```

**Precio final de una variante:**
```typescript
const finalPrice = product.basePrice + variant.priceModifier;
// 29.99 + 5.00 = 34.99
```

### ProductCategory

```typescript
interface ProductCategoryProps {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  parentId: string | null;      // null = categoría raíz
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
```

Soporta categorías jerárquicas (padre/hijo).

### ProductUnitMeasure

```typescript
type UnitType = 'unit' | 'weight' | 'volume' | 'length' | 'area';

interface ProductUnitMeasureProps {
  id: string;
  businessId: string;
  name: string;                  // ej: "Kilogramo"
  abbreviation: string;          // ej: "kg"
  type: UnitType;
  conversionFactor: number;       // Factor a la unidad base
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
```

**Ejemplos:**
| Nombre | Abreviatura | Tipo | Factor |
|--------|-------------|------|--------|
| Unidad | u | unit | 1 |
| Kilogramo | kg | weight | 1000 |
| Gramo | g | weight | 1 |
| Litro | L | volume | 1000 |
| Mililitro | mL | volume | 1 |

## API REST

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/products` | Crear producto |
| GET | `/api/v1/products` | Listar productos (paginado) |
| GET | `/api/v1/products/:id` | Obtener producto por ID |
| PATCH | `/api/v1/products/:id` | Actualizar producto |
| DELETE | `/api/v1/products/:id` | Eliminar producto (lógico) |

### Variantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/products/:productId/variants` | Crear variante |
| GET | `/api/v1/products/:productId/variants` | Listar variantes |
| GET | `/api/v1/products/:productId/variants/:id` | Obtener variante |
| PATCH | `/api/v1/products/:productId/variants/:id` | Actualizar variante |
| DELETE | `/api/v1/products/:productId/variants/:id` | Eliminar variante |

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/product-categories` | Crear categoría |
| GET | `/api/v1/product-categories` | Listar categorías |
| GET | `/api/v1/product-categories/:id` | Obtener categoría |
| PATCH | `/api/v1/product-categories/:id` | Actualizar categoría |
| DELETE | `/api/v1/product-categories/:id` | Eliminar categoría |

### Unidades de Medida

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/product-unit-measures` | Crear unidad |
| GET | `/api/v1/product-unit-measures` | Listar unidades |
| GET | `/api/v1/product-unit-measures/:id` | Obtener unidad |
| PATCH | `/api/v1/product-unit-measures/:id` | Actualizar unidad |
| DELETE | `/api/v1/product-unit-measures/:id` | Eliminar unidad |

## Integración con Otros Módulos

```
products ──────► core (businessId, auditoría)
         └──────► auth (userId para createdBy/updatedBy)
```

### ProductsModule como Proveedor

ProductsModule es un **módulo de negocio** que puede ser consumido por otros módulos:

```
StockForecastModule ──► ProductsModule (para conocer productos a predecir)
InventoryModule ──────► ProductsModule (para conocer trackInventory, unitMeasure)
OrderModule ──────────► ProductsModule (para conocer precios, variantes)
```

### Habilitación

```env
ENABLED_MODULES=PRODUCTS
```

## Tests

El módulo incluye tests unitarios para:
- `create-product.use-case.spec.ts`
- `update-product.use-case.spec.ts`
- `delete-product.use-case.spec.ts`
- `get-product.use-case.spec.ts`
- `list-products.use-case.spec.ts`
- Entidades: `product.entity.spec.ts`, `product-variant.entity.spec.ts`, etc.
