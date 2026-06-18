# InventoryModule

Documentación técnica del módulo de inventario.

## Índice

1. [Visión General](./01-inventory-overview.md) - Arquitectura, modelo de dominio, endpoints
2. [Guía de Uso](./02-inventory-usage.md) - Ejemplos de uso de todos los casos de uso
3. [Integración](./03-inventory-integration.md) - Integración con otros módulos

## Resumen

El `InventoryModule` gestiona el stock de productos basado en **movimientos de doble entrada**, inspirado en el modelo de Odoo.

### Características Principales

- **Double Entry**: Todo movimiento tiene origen y destino
- **Ubicaciones**: Almacenes jerárquicos con tipos (INTERNAL, SUPPLIER, CUSTOMER, TRANSIT, ADJUSTMENT)
- **Movimientos**: Estados (DRAFT → CONFIRMED → DONE) y tipos (INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT)
- **Stock Calculado**: No se almacena stock; se calcula de movimientos en tiempo real

### API REST

| Recurso | Endpoint Base |
|---------|---------------|
| Ubicaciones | `/api/v1/inventory/locations` |
| Movimientos | `/api/v1/inventory/moves` |
| Stock | `/api/v1/inventory/stock` |

### Habilitación

```env
ENABLED_MODULES=INVENTORY
```

## Path Alias

```typescript
import { ... } from '#inventory';
```
