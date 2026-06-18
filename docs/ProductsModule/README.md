# ProductsModule

Documentación técnica del módulo de gestión de productos.

## Índice

1. [Visión General](./01-products-overview.md) - Arquitectura, modelo de dominio, endpoints
2. [Guía de Uso](./02-products-usage.md) - Ejemplos de uso de todos los casos de uso
3. [Integración](./03-products-integration.md) - Cómo integrar con otros módulos

## Resumen

El `ProductsModule` es un **módulo global** de NestJS que gestiona el catálogo de productos de un negocio.

### Características Principales

- **Productos** con tipos: almacenable, consumible, servicio
- **Variantes** con atributos (color, talla, etc.)
- **Categorías** jerárquicas (padre/hijo)
- **Unidades de medida** con conversión

### API REST

| Recurso | Endpoint Base |
|---------|---------------|
| Productos | `/api/v1/products` |
| Variantes | `/api/v1/products/:productId/variants` |
| Categorías | `/api/v1/product-categories` |
| Unidades | `/api/v1/product-unit-measures` |

### Habilitación

```env
ENABLED_MODULES=PRODUCTS
```

##path-alias

```typescript
import { ... } from '#products';
```
