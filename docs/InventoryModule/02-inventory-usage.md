# Uso del Módulo de Inventario

## Inyección de Use Cases

```typescript
import { Injectable } from '@nestjs/common';
import {
  CreateLocationUseCase,
  ListLocationsUseCase,
  UpdateLocationUseCase,
  CreateMoveUseCase,
  ConfirmMoveUseCase,
  CompleteMoveUseCase,
  ListMovesUseCase,
  GetStockUseCase,
  AdjustInventoryUseCase,
  INVENTORY_LOCATION_REPOSITORY,
  INVENTORY_MOVE_REPOSITORY,
  InventoryLocationRepository,
  InventoryMoveRepository,
} from '#inventory';

@Injectable()
export class MiServicio {
  constructor(
    private readonly createLocation: CreateLocationUseCase,
    private readonly createMove: CreateMoveUseCase,
    private readonly confirmMove: ConfirmMoveUseCase,
    private readonly completeMove: CompleteMoveUseCase,
    private readonly getStock: GetStockUseCase,
    private readonly adjustInventory: AdjustInventoryUseCase,
    @Inject(INVENTORY_LOCATION_REPOSITORY)
    private readonly locationRepo: InventoryLocationRepository,
    @Inject(INVENTORY_MOVE_REPOSITORY)
    private readonly moveRepo: InventoryMoveRepository,
  ) {}
}
```

---

## Ubicaciones

### Crear Ubicación

```typescript
const result = await this.createLocation.execute({
  businessId: 'uuid-negocio',
  code: 'WH-001',
  name: 'Almacén Principal',
  type: 'INTERNAL',
});

console.log(result.location.id);      // UUID generado
console.log(result.location.code);    // 'WH-001'
console.log(result.location.isActive); // true
```

### Crear Ubicación con Dirección

```typescript
const result = await this.createLocation.execute({
  businessId: 'uuid-negocio',
  code: 'WH-MAIN',
  name: 'Almacén Central',
  type: 'INTERNAL',
  address: {
    street: 'Av. Principal 123',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '06600',
    countryCode: 'MX',
  },
});
```

### Listar Ubicaciones

```typescript
const result = await this.locationRepo.list(businessId, {
  isActive: true,
});

result.data.forEach((location) => {
  console.log(`${location.code} - ${location.name}`);
});
```

### Actualizar Ubicación

```typescript
await this.updateLocation.execute({
  id: 'uuid-ubicacion',
  businessId: 'uuid-negocio',
  name: 'Almacén Principal Actualizado',
  type: 'INTERNAL',
});
```

---

## Movimientos de Stock

### Flujo de Trabajo: Crear → Confirmar → Completar

Los movimientos siguen un ciclo de vida: `DRAFT` → `CONFIRMED` → `DONE`

```typescript
// 1. Crear movimiento (estado inicial: DRAFT)
const move = await this.createMove.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  variantId: 'uuid-variante',       // opcional
  moveType: 'INBOUND',
  quantity: '100',
  unitOfMeasureId: 'uuid-uom',
  toLocationId: 'uuid-almacen',    // obligatorio para INBOUND
  reference: 'PO-2026-001',
  notes: 'Receiving purchase order',
});

console.log(move.move.state);  // 'DRAFT'

// 2. Confirmar movimiento (prepara el stock)
const confirmed = await this.confirmMove.execute({
  id: move.move.id,
  businessId: 'uuid-negocio',
});

console.log(confirmed.move.state);  // 'CONFIRMED'

// 3. Completar movimiento (afecta el stock real)
const completed = await this.completeMove.execute({
  id: confirmed.move.id,
  businessId: 'uuid-negocio',
});

console.log(completed.move.state);  // 'DONE'
```

### Recibir Mercadería (INBOUND)

```typescript
const move = await this.createMove.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  moveType: 'INBOUND',
  quantity: '50',
  unitOfMeasureId: 'uuid-unidad',
  toLocationId: 'uuid-almacen',
  reference: 'PO-2026-001',
  originTable: 'purchase_order',
  originId: 'uuid-po',
});

// Confirmar y completar
await this.confirmMove.execute({ id: move.move.id, businessId });
await this.completeMove.execute({ id: move.move.id, businessId });
```

### Entregar a Cliente (OUTBOUND)

```typescript
const move = await this.createMove.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  moveType: 'OUTBOUND',
  quantity: '5',
  unitOfMeasureId: 'uuid-unidad',
  fromLocationId: 'uuid-almacen',
  reference: 'SO-2026-001',
  originTable: 'sale_order',
  originId: 'uuid-so',
});

// Confirmar y completar
await this.confirmMove.execute({ id: move.move.id, businessId });
await this.completeMove.execute({ id: move.move.id, businessId });
```

### Transferencia entre Ubicaciones (TRANSFER)

```typescript
const move = await this.createMove.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  moveType: 'TRANSFER',
  quantity: '20',
  unitOfMeasureId: 'uuid-unidad',
  fromLocationId: 'uuid-almacen-origen',
  toLocationId: 'uuid-almacen-destino',
  reference: 'TRANSFER-001',
});

// Confirmar y completar
await this.confirmMove.execute({ id: move.move.id, businessId });
await this.completeMove.execute({ id: move.move.id, businessId });
```

### Ajuste de Inventario (ADJUSTMENT)

```typescript
// Crear movimiento de ajuste
const move = await this.createMove.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  moveType: 'ADJUSTMENT',
  quantity: '2',  // Positivo = entrada, Negativo = salida
  unitOfMeasureId: 'uuid-unidad',
  fromLocationId: 'uuid-ajuste',    // null para entrada
  toLocationId: 'uuid-almacen',     // ubicación a ajustar
  notes: 'Conteo físico - encontró 2 unidades de más',
});

// Completar directamente (los ajustes van directo a DONE)
await this.completeMove.execute({ id: move.move.id, businessId });
```

---

## Consultar Stock

### Stock por Producto y Ubicación

```typescript
const result = await this.getStock.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  locationId: 'uuid-almacen',
});

console.log(result.stocks[0].quantity);    // '100'
console.log(result.total);                 // '100'
```

### Stock en Todas las Ubicaciones

```typescript
const result = await this.getStock.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  // Sin locationId = todas las ubicaciones
});

result.stocks.forEach((stock) => {
  console.log(`${stock.locationName}: ${stock.quantity}`);
});
console.log(`Total: ${result.total}`);
```

### Stock por Variante

```typescript
const result = await this.getStock.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  variantId: 'uuid-variante-roja',
  locationId: 'uuid-almacen',
});
```

---

## Ajuste de Inventario (Recuento)

El método de ajuste crea movimientos automáticamente para corregir diferencias:

```typescript
// Inventario real: 95 unidades
// Sistema dice: 100 unidades
// Diferencia: -5 unidades

await this.adjustInventory.execute({
  businessId: 'uuid-negocio',
  productId: 'uuid-producto',
  locationId: 'uuid-almacen',
  newQuantity: '95',
  reason: 'Conteo físico 发现 95 en lugar de 100',
  createdBy: 'uuid-usuario',
});
```

**Nota:** El ajuste crea automáticamente un movimiento `OUTBOUND` con quantity `5` para corregir.

---

## Listar Movimientos

### Listar Movimientos con Filtros

```typescript
const result = await this.moveRepo.list('uuid-negocio', {
  productId: 'uuid-producto',
  locationId: 'uuid-almacen',
  moveType: 'INBOUND',
  state: 'DONE',
  page: 1,
  pageSize: 20,
});

result.data.forEach((move) => {
  console.log(`${move.reference}: ${move.quantity} unidades`);
});
```

### Listar Historial de Movimientos

```typescript
const result = await this.moveRepo.list('uuid-negocio', {
  productId: 'uuid-producto',
  daysBack: 30,  // Últimos 30 días
});
```

---

## Patrones de Uso

### Crear Recepciones de Compra

```typescript
async function receivePurchaseOrder(
  businessId: string,
  purchaseOrderId: string,
  items: Array<{ productId: string; quantity: string }>,
  locationId: string,
) {
  for (const item of items) {
    // Crear movimiento INBOUND
    const move = await this.createMove.execute({
      businessId,
      productId: item.productId,
      moveType: 'INBOUND',
      quantity: item.quantity,
      unitOfMeasureId: 'uuid-unidad',
      toLocationId: locationId,
      reference: `PO-${purchaseOrderId}`,
      originTable: 'purchase_order',
      originId: purchaseOrderId,
    });

    // Completar directamente
    await this.completeMove.execute({
      id: move.move.id,
      businessId,
    });
  }
}
```

### Crear Entregas de Venta

```typescript
async function deliverSaleOrder(
  businessId: string,
  saleOrderId: string,
  items: Array<{ productId: string; quantity: string }>,
  locationId: string,
) {
  for (const item of items) {
    // Crear movimiento OUTBOUND
    const move = await this.createMove.execute({
      businessId,
      productId: item.productId,
      moveType: 'OUTBOUND',
      quantity: item.quantity,
      unitOfMeasureId: 'uuid-unidad',
      fromLocationId: locationId,
      reference: `SO-${saleOrderId}`,
      originTable: 'sale_order',
      originId: saleOrderId,
    });

    // Completar directamente
    await this.completeMove.execute({
      id: move.move.id,
      businessId,
    });
  }
}
```

### Validar Stock Antes de Reservar

```typescript
async function reserveStock(
  businessId: string,
  productId: string,
  quantity: string,
  locationId: string,
) {
  // Consultar stock disponible
  const stock = await this.getStock.execute({
    businessId,
    productId,
    locationId,
  });

  const available = parseFloat(stock.total);
  const requested = parseFloat(quantity);

  if (available < requested) {
    throw new Error(
      `Stock insuficiente. Disponible: ${available}, Solicitado: ${requested}`,
    );
  }

  // Crear movimiento OUTBOUND en estado DRAFT (reserva)
  const move = await this.createMove.execute({
    businessId,
    productId,
    moveType: 'OUTBOUND',
    quantity,
    unitOfMeasureId: 'uuid-unidad',
    fromLocationId: locationId,
    reference: `RESERVE-${Date.now()}`,
  });

  // Confirmar la reserva
  return this.confirmMove.execute({
    id: move.move.id,
    businessId,
  });
}
```

---

## Validaciones

| Campo | Regla |
|-------|-------|
| `quantity` | Requerido, > 0 |
| `moveType` | Requerido: `INBOUND`, `OUTBOUND`, `TRANSFER`, `ADJUSTMENT`, `INTERNAL` |
| `toLocationId` | Requerido para `INBOUND` |
| `fromLocationId` | Requerido para `OUTBOUND` |
| `unitOfMeasureId` | Requerido |

---

## Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| `400` | Datos inválidos |
| `404` | Ubicación o movimiento no encontrado |
| `422` | Movimiento no puede cambiar de estado (ej: confirmar un DONE) |
