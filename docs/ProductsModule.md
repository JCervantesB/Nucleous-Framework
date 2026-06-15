# ProductsModule - Módulo de Productos

## 1. Visión General

El módulo de **Productos** es un módulo de negocio que gestiona el catálogo de productos de un negocio. Permite definir productos con sus variantes, tipos, categorías y unidades de medida.

### Objetivos del Módulo

- Mantener un catálogo de productos organizados por categorías
- Soportar múltiples tipos de productos: almacenables (storable), consumibles y servicios
- Manejar variantes de productos (tallas, colores, etc.)
- Definir unidades de medida para inventario
- Preparado para integración con módulo de inventario (futuro)

## 2. Modelo de Dominio

### 2.1 Entidades Principales

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

### 2.2 Producto (Product)

```typescript
export type ProductType = 'storable' | 'consumable' | 'service';

interface ProductProps {
  id: string;
  businessId: string;
  sku: string;
  name: string;
  description: string | null;
  type: ProductType;
  categoryId: string | null;
  basePrice: number;
  currencyCode: string;
  isActive: boolean;
  trackInventory: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}
```

**Reglas de negocio:**
- `sku` debe ser único dentro de un business
- `type` define el comportamiento del producto
- `trackInventory` solo es relevante para `storable` y `consumable`

### 2.3 Variante de Producto (ProductVariant)

```typescript
interface ProductVariantProps {
  id: string;
  productId: string;
  sku: string;
  name: string;
  priceModifier: number;  // Se suma al precio base del producto
  attributes: Record<string, string>;  // { "color": "rojo", "talla": "M" }
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
```

### 2.4 Categoría de Producto (ProductCategory)

```typescript
interface ProductCategoryProps {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  parentId: string | null;  // Para categorías jerárquicas
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
```

### 2.5 Unidad de Medida (ProductUnitMeasure)

```typescript
type UnitType = 'unit' | 'weight' | 'volume' | 'length' | 'area';

interface ProductUnitMeasureProps {
  id: string;
  businessId: string;
  name: string;
  abbreviation: string;
  type: UnitType;
  conversionFactor: number;  // Factor de conversión a la unidad base
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
```

## 3. API REST - Endpoints

### 3.1 Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/products` | Crear producto |
| GET | `/api/v1/products` | Listar productos (paginado) |
| GET | `/api/v1/products/:id` | Obtener producto por ID |
| PATCH | `/api/v1/products/:id` | Actualizar producto |
| DELETE | `/api/v1/products/:id` | Eliminar producto |

### 3.2 Variantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/products/:productId/variants` | Crear variante |
| GET | `/api/v1/products/:productId/variants` | Listar variantes |
| GET | `/api/v1/products/:productId/variants/:id` | Obtener variante |
| PATCH | `/api/v1/products/:productId/variants/:id` | Actualizar variante |
| DELETE | `/api/v1/products/:productId/variants/:id` | Eliminar variante |

### 3.3 Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/product-categories` | Crear categoría |
| GET | `/api/v1/product-categories` | Listar categorías |
| GET | `/api/v1/product-categories/:id` | Obtener categoría |
| PATCH | `/api/v1/product-categories/:id` | Actualizar categoría |
| DELETE | `/api/v1/product-categories/:id` | Eliminar categoría |

### 3.4 Unidades de Medida

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/product-unit-measures` | Crear unidad |
| GET | `/api/v1/product-unit-measures` | Listar unidades |
| GET | `/api/v1/product-unit-measures/:id` | Obtener unidad |
| PATCH | `/api/v1/product-unit-measures/:id` | Actualizar unidad |
| DELETE | `/api/v1/product-unit-measures/:id` | Eliminar unidad |

## 4. Reglas de Negocio

### 4.1 SKU
- Debe ser único dentro de un negocio (businessId)
- Formato libre, se recomienda: `XXXX-000` o similar

### 4.2 Precio
- `basePrice` es el precio base sin variantes
- El precio final de una variante = `basePrice + priceModifier`
- Todos los precios se almacenan en la moneda del negocio

### 4.3 Eliminación Lógica
- Los productos, categorías se eliminan lógicamente (`isActive = false`)
- Los productos inactivos no aparecen en listados por defecto

## 5. Integración con Otros Módulos

```
products ──────► core (businessId, auditoría)
         └──────► auth (userId para createdBy/updatedBy)
```

El módulo de productos está preparado para integrarse con el módulo de inventario:
- `Product.trackInventory` indica si el producto requiere control de stock
- `ProductUnitMeasure` proporciona las unidades base para gestionar conversiones de stock
- Las variantes pueden tener stock independiente
