# Uso del Módulo de Productos

## Inyección de Use Cases

Los use cases se injectan usando los tokens definidos en `products.tokens.ts`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  CreateProductUseCase,
  ListProductsUseCase,
  GetProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
  PRODUCT_REPOSITORY,
} from '#products';

@Injectable()
export class MiServicio {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}
}
```

---

## Crear un Producto

### Básico

```typescript
const result = await this.createProduct.execute({
  businessId: 'uuid-negocio',
  sku: 'CAM-001',
  name: 'Camiseta Básica',
  description: 'Camiseta de algodón 100%',
  type: 'storable',
  basePrice: 29.99,
  currencyCode: 'USD',
  trackInventory: true,
});

console.log(result.product.id);      // UUID generado
console.log(result.product.sku);      // 'CAM-001'
console.log(result.product.isActive);  // true
```

### Con Categoría

```typescript
const result = await this.createProduct.execute({
  businessId: 'uuid-negocio',
  sku: 'PANT-001',
  name: 'Pantalón Jeans',
  type: 'storable',
  categoryId: 'uuid-categoria-ropa',  // ID de categoría existente
  basePrice: 59.99,
  currencyCode: 'USD',
  trackInventory: true,
});
```

### Producto Tipo Servicio

```typescript
const result = await this.createProduct.execute({
  businessId: 'uuid-negocio',
  sku: 'SVC-ENVIO',
  name: 'Envío Express',
  type: 'service',
  basePrice: 15.00,
  currencyCode: 'USD',
  trackInventory: false,  // Los servicios no necesitan tracking
});
```

### Error: SKU Duplicado

```typescript
try {
  await this.createProduct.execute({
    businessId: 'uuid-negocio',
    sku: 'CAM-001',  // Ya existe
    name: 'Otro Producto',
    type: 'storable',
    basePrice: 19.99,
  });
} catch (error) {
  console.log(error.message);  // "Ya existe un producto con SKU: CAM-001"
}
```

---

## Listar Productos

### Listar con Paginación

```typescript
const result = await this.listProducts.execute({
  businessId: 'uuid-negocio',
  options: {
    page: 1,
    pageSize: 20,
  },
});

console.log(result.data);     // Array de productos
console.log(result.total);    // Total de productos
console.log(result.page);     // 1
console.log(result.pageSize); // 20
```

### Buscar por Nombre o SKU

```typescript
const result = await this.listProducts.execute({
  businessId: 'uuid-negocio',
  options: {
    search: 'camiseta',
    pageSize: 10,
  },
});
```

### Filtrar por Tipo

```typescript
const result = await this.listProducts.execute({
  businessId: 'uuid-negocio',
  options: {
    type: 'storable',
  },
});
```

---

## Obtener Producto

```typescript
const result = await this.getProduct.execute({
  id: 'uuid-producto',
  businessId: 'uuid-negocio',
});

if (result.product) {
  console.log(result.product.name);
  console.log(result.product.basePrice);
} else {
  console.log('Producto no encontrado');
}
```

---

## Actualizar Producto

```typescript
await this.updateProduct.execute({
  id: 'uuid-producto',
  businessId: 'uuid-negocio',
  name: 'Camiseta Premium',
  basePrice: 34.99,
  categoryId: 'uuid-nueva-categoria',
});

console.log('Producto actualizado');
```

---

## Eliminar Producto (Lógico)

```typescript
await this.deleteProduct.execute({
  id: 'uuid-producto',
  businessId: 'uuid-negocio',
});

// El producto ahora tiene isActive = false
// No aparecerá en listados por defecto
```

---

## Variantes de Producto

### Crear Variante

```typescript
import { CreateVariantUseCase } from '#products';

const createVariant: CreateVariantUseCase;

const result = await createVariant.execute({
  productId: 'uuid-producto',
  businessId: 'uuid-negocio',
  sku: 'CAM-001-R-M',
  name: 'Camiseta Roja Talla M',
  priceModifier: 5.00,  // Precio final: 29.99 + 5.00 = 34.99
  attributes: {
    color: 'rojo',
    talla: 'M',
  },
});
```

### Listar Variantes

```typescript
import { ListVariantsUseCase } from '#products';

const listVariants: ListVariantsUseCase;

const result = await listVariants.execute({
  productId: 'uuid-producto',
  businessId: 'uuid-negocio',
});

result.data.forEach((variant) => {
  const precioFinal = producto.basePrice + variant.priceModifier;
  console.log(`${variant.name}: $${precioFinal}`);
});
```

### Ejemplo: Tallas y Colores

```typescript
// Crear producto base
const producto = await createProduct.execute({
  businessId,
  sku: 'CAM-BASICA',
  name: 'Camiseta Básica',
  type: 'storable',
  basePrice: 29.99,
  trackInventory: true,
});

// Crear variantes para cada combinación
const tallas = ['S', 'M', 'L', 'XL'];
const colores = ['rojo', 'azul', 'negro'];

for (const talla of tallas) {
  for (const color of colores) {
    await createVariant.execute({
      productId: producto.product.id,
      businessId,
      sku: `CAM-BASICA-${color.substring(0, 2).toUpperCase()}-${talla}`,
      name: `Camiseta ${color} Talla ${talla}`,
      priceModifier: color === 'negro' ? 2.00 : 0,  // Negro tiene recargo
      attributes: { color, talla },
    });
  }
}
```

---

## Categorías

### Crear Categoría

```typescript
import { CreateCategoryUseCase } from '#products';

const createCategory: CreateCategoryUseCase;

// Categoría raíz
const categoriaRopa = await createCategory.execute({
  businessId: 'uuid-negocio',
  name: 'Ropa',
  description: 'Categoría principal de ropa',
});

// Subcategoría
const categoriaCamisetas = await createCategory.execute({
  businessId: 'uuid-negocio',
  name: 'Camisetas',
  description: 'Camisetas de todo tipo',
  parentId: categoriaRopa.category.id,
});
```

### Listar Categorías (Jerárquico)

```typescript
import { ListCategoriesUseCase } from '#products';

const listCategories: ListCategoriesUseCase;

const result = await listCategories.execute({
  businessId: 'uuid-negocio',
});

result.data.forEach((category) => {
  if (category.parentId) {
    console.log(`  └── ${category.name}`);
  } else {
    console.log(category.name);
  }
});
```

---

## Unidades de Medida

### Crear Unidad

```typescript
import { CreateUnitMeasureUseCase } from '#products';

const createUnitMeasure: CreateUnitMeasureUseCase;

// Unidad base
await createUnitMeasure.execute({
  businessId: 'uuid-negocio',
  name: 'Unidad',
  abbreviation: 'u',
  type: 'unit',
  conversionFactor: 1,
  isDefault: true,
});

// Kilogramo (base = gramo)
await createUnitMeasure.execute({
  businessId: 'uuid-negocio',
  name: 'Kilogramo',
  abbreviation: 'kg',
  type: 'weight',
  conversionFactor: 1000,
  isDefault: false,
});

// Litro (base = mililitro)
await createUnitMeasure.execute({
  businessId: 'uuid-negocio',
  name: 'Litro',
  abbreviation: 'L',
  type: 'volume',
  conversionFactor: 1000,
  isDefault: false,
});
```

---

## Uso Avanzado

### Consumir Repository Directamente

Para operaciones más complejas, usa el repositorio directamente:

```typescript
@Injectable()
export class MiService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async findBySku(sku: string, businessId: string) {
    return this.productRepo.findBySku(sku, businessId);
  }

  async listActivos(businessId: string) {
    const result = await this.productRepo.list(businessId, {
      page: 1,
      pageSize: 100,
    });
    return result.data.filter(p => p.isActive);
  }
}
```

### Integración con InventoryModule

El campo `trackInventory` indica si el producto requiere control de stock:

```typescript
const product = await this.getProduct.execute({ id, businessId });

if (product.product?.trackInventory) {
  // Este producto necesita gestión de stock
  // Crear registro en InventoryModule
  await inventoryService.createStockRecord({
    productId: product.product.id,
    currentQuantity: 0,
    unitMeasureId: 'uuid-unidad',
  });
}
```

---

## Validaciones

| Campo | Regla |
|-------|-------|
| `sku` | Requerido, único por negocio, max 50 chars |
| `name` | Requerido, max 255 chars |
| `description` | Opcional, max 2000 chars |
| `type` | Requerido: `storable`, `consumable`, `service` |
| `basePrice` | Requerido, >= 0 |
| `currencyCode` | Opcional, código ISO 4217 (default: USD) |
| `trackInventory` | Opcional, boolean (default: false) |

---

## Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| `400` | Datos inválidos (validación fallida) |
| `404` | Producto/Categoría no encontrado |
| `409` | SKU duplicado dentro del negocio |

---

## Ejemplo Completo: Crear Catálogo

```typescript
async function crearCatalogoEjemplo(businessId: string) {
  // 1. Crear categorías
  const electronica = await createCategory.execute({
    businessId,
    name: 'Electrónica',
  });

  const ropa = await createCategory.execute({
    businessId,
    name: 'Ropa',
  });

  // 2. Crear unidades de medida
  await createUnitMeasure.execute({
    businessId,
    name: 'Unidad',
    abbreviation: 'u',
    type: 'unit',
    conversionFactor: 1,
    isDefault: true,
  });

  // 3. Crear productos
  const telefono = await createProduct.execute({
    businessId,
    sku: 'TEL-001',
    name: 'Smartphone XYZ',
    type: 'storable',
    categoryId: electronica.category.id,
    basePrice: 699.99,
    trackInventory: true,
  });

  const camiseta = await createProduct.execute({
    businessId,
    sku: 'CAM-001',
    name: 'Camiseta Básica',
    type: 'storable',
    categoryId: ropa.category.id,
    basePrice: 29.99,
    trackInventory: true,
  });

  // 4. Crear variantes
  await createVariant.execute({
    productId: camiseta.product.id,
    businessId,
    sku: 'CAM-001-AZ-S',
    name: 'Camiseta Azul Talla S',
    priceModifier: 0,
    attributes: { color: 'azul', talla: 'S' },
  });

  await createVariant.execute({
    productId: camiseta.product.id,
    businessId,
    sku: 'CAM-001-AZ-M',
    name: 'Camiseta Azul Talla M',
    priceModifier: 0,
    attributes: { color: 'azul', talla: 'M' },
  });

  console.log('Catálogo creado exitosamente');
}
```
