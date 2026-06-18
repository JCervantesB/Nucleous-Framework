# Visión General del Módulo de Inventario (InventoryModule)

## Arquitectura

El `InventoryModule` gestiona el stock de productos basado en **movimientos de doble entrada**, inspirado en el modelo de Odoo. No se modifica el stock directamente; siempre se crea un movimiento.

```
src/inventory/
├── domain/                         # Entidades y contratos (puro)
│   ├── entities/
│   │   ├── inventory-location.entity.ts  # Ubicaciones (almacenes)
│   │   ├── inventory-move.entity.ts     # Movimientos de stock
│   │   └── index.ts
│   ├── repositories/
│   │   ├── inventory-location.repository.ts
│   │   └── inventory-move.repository.ts
│   └── inventory.tokens.ts         # Símbolos de inyección
├── application/                    # Casos de uso
│   └── use-cases/
│       ├── create-location.use-case.ts
│       ├── list-locations.use-case.ts
│       ├── update-location.use-case.ts
│       ├── create-move.use-case.ts
│       ├── confirm-move.use-case.ts
│       ├── complete-move.use-case.ts
│       ├── list-moves.use-case.ts
│       ├── get-stock.use-case.ts
│       └── adjust-inventory.use-case.ts
├── infrastructure/
│   └── persistence/
│       ├── drizzle-location.repository.ts
│       └── drizzle-move.repository.ts
├── interfaces/http/
│   ├── location.controller.ts
│   ├── move.controller.ts
│   ├── stock.controller.ts
│   └── dto/
│       ├── location.dtos.ts
│       ├── move.dtos.ts
│       └── stock.dtos.ts
└── inventory.module.ts
```

## Filosofía: Double Entry

```
Stock Disponible (Location) = Σ(INBOUND a location) - Σ(OUTBOUND desde location)
```

**Reglas fundamentales:**
1. **Nunca** se modifica el stock directamente
2. **Siempre** hay un movimiento desde una ubicación de origen hacia una de destino
3. El stock disponible se calcula como la suma de movimientos por ubicación

## Modelo de Dominio

### Entidades

```
┌─────────────────────┐       ┌─────────────────────┐
│  InventoryLocation   │◄──────│   InventoryMove      │
│                     │       │                     │
│  - warehouse        │       │  - productId        │
│  - storage areas    │       │  - fromLocationId   │
│  - shelves          │       │  - toLocationId    │
└─────────────────────┘       │  - quantity         │
                              │  - moveType        │
                              │  - state           │
                              └─────────────────────┘
```

### InventoryLocation

Ubicaciones de inventario (almacenes, pasillos, estantes).

```typescript
export type LocationType =
  | 'INTERNAL'    // Almacén propio
  | 'SUPPLIER'   // Ubicación de proveedor
  | 'CUSTOMER'   // Ubicación de cliente
  | 'TRANSIT'    // En tránsito
  | 'ADJUSTMENT'; // Movimientos de corrección

interface InventoryLocationProps {
  id: string;
  businessId: string;
  code: string;                 // ej: "WH-001"
  name: string;                 // ej: "Almacén Principal"
  type: LocationType;
  contactId: string | null;
  address: Address | null;
  isActive: boolean;
  isTransit: boolean;           // true si type === 'TRANSIT'
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}
```

**Tipos de ubicación:**

| Type | Descripción |
|------|-------------|
| `INTERNAL` | Almacén propio (stock principal) |
| `SUPPLIER` | Para recibo de compras |
| `CUSTOMER` | Para entregas a clientes |
| `TRANSIT` | Transferencias entre almacenes |
| `ADJUSTMENT` | Movimientos de corrección |

**Jerarquía ejemplo:**
```
WH-001 (Warehouse - INTERNAL)
  ├── ZONE-A (Zone - INTERNAL)
  │   ├── SHELF-001 (Shelf - INTERNAL)
  │   └── SHELF-002 (Shelf - INTERNAL)
  └── ZONE-B (Zone - INTERNAL)
```

### InventoryMove

Movimiento de stock con doble entrada (origen → destino).

```typescript
export type MoveType =
  | 'INBOUND'     // Entrada de mercadería
  | 'OUTBOUND'    // Salida de mercadería
  | 'TRANSFER'    // Transferencia entre ubicaciones
  | 'ADJUSTMENT'  // Ajuste de inventario
  | 'INTERNAL';   // Movimiento interno

export type MoveState =
  | 'DRAFT'       // Borrador, no confirmado
  | 'CONFIRMED'   // Confirmado, pendiente
  | 'DONE'        // Completado (afecta stock)
  | 'CANCELLED';  // Cancelado

interface InventoryMoveProps {
  id: string;
  businessId: string;
  productId: string;
  variantId: string | null;
  moveType: MoveType;
  state: MoveState;
  fromLocationId: string | null;   // null = exterior/proveedor
  toLocationId: string | null;    // null = exterior/cliente
  quantity: string;                // Cantidad (string para precisión)
  unitOfMeasureId: string;
  reference: string | null;        // "PO-001", "SO-001"
  notes: string | null;
  externalId: string | null;
  originTable: string | null;      // Tabla de origen (ej: "purchase_order")
  originId: string | null;         // ID del documento origen
  confirmedAt: Date | null;
  doneAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}
```

**Ciclo de vida del movimiento:**

```
DRAFT ──► CONFIRMED ──► DONE
   │           │
   ▼           ▼
CANCELLED   CANCELLED
```

**Estados y su efecto en stock:**

| State | Descripción | Afecta Stock |
|-------|-------------|--------------|
| `DRAFT` | Borrador | No |
| `CONFIRMED` | Reservado | Reserved (futuro) |
| `DONE` | Completado | Sí - on_hand |
| `CANCELLED` | Cancelado | No |

**Tipos de movimiento:**

| MoveType | fromLocationId | toLocationId | Ejemplo |
|----------|---------------|-------------|---------|
| `INBOUND` | `null` | warehouse | Recibir de proveedor |
| `OUTBOUND` | warehouse | `null` | Entregar a cliente |
| `TRANSFER` | warehouse-A | warehouse-B | Transferencia |
| `ADJUSTMENT` | adjustment | warehouse | Ajuste positivo |
| `INTERNAL` | warehouse | warehouse | Movimiento interno |

## Cálculo de Stock

### Regla Fundamental

```typescript
on_hand(location, product) =
  Σ(INBOUND WHERE state='DONE' AND toLocationId=location) -
  Σ(OUTBOUND WHERE state='DONE' AND fromLocationId=location)
```

### Implementación: Consulta en Tiempo Real

> **Decisión de diseño:** La v1 del InventoryModule usa cálculo on-the-fly. No se almacena stock agregado; se calcula a partir de los movimientos.

```typescript
async calculateStock(productId: string, locationId: string): Promise<number> {
  const inbound = await this.moveRepo.sumQuantity({
    productId,
    toLocationId: locationId,
    state: 'DONE',
    moveTypes: ['INBOUND', 'ADJUSTMENT'],
  });

  const outbound = await this.moveRepo.sumQuantity({
    productId,
    fromLocationId: locationId,
    state: 'DONE',
    moveTypes: ['OUTBOUND', 'ADJUSTMENT'],
  });

  return parseFloat(inbound) - parseFloat(outbound);
}
```

## API REST

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/inventory/locations` | Crear ubicación |
| GET | `/api/v1/inventory/locations` | Listar ubicaciones |
| GET | `/api/v1/inventory/locations/:id` | Obtener ubicación |
| PATCH | `/api/v1/inventory/locations/:id` | Actualizar ubicación |
| DELETE | `/api/v1/inventory/locations/:id` | Eliminar ubicación |

### Movimientos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/inventory/moves` | Crear movimiento |
| GET | `/api/v1/inventory/moves` | Listar movimientos |
| GET | `/api/v1/inventory/moves/:id` | Obtener movimiento |

### Stock

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/inventory/stock` | Consultar stock |
| POST | `/api/v1/inventory/adjust` | Ajustar stock |

## Integración con ProductsModule

```
┌─────────────────┐       ┌─────────────────┐
│ ProductsModule   │       │ InventoryModule │
├─────────────────┤       ├─────────────────┤
│ Product         │◄──────│ - Consulta stock│
│ ProductVariant  │       │ - Usa UoM      │
│ ProductUnitMeasure│     │                 │
│                 │       │                 │
│ trackInventory  │──────►│ - Si true,     │
│                 │       │   requiere move │
└─────────────────┘       └─────────────────┘
```

**Reglas:**
1. Si `product.trackInventory = false`, no se requieren movimientos
2. Usar `unitOfMeasureId` para la cantidad del movimiento
3. InventoryModule **NO** modifica productos

## Tests

El módulo incluye tests unitarios para:
- Entidades: `inventory-move.entity.spec.ts`, `inventory-location.entity.spec.ts`
- Use cases: `create-location.use-case.spec.ts`

## Habilitación

```env
ENABLED_MODULES=INVENTORY
```
