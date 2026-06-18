# Seeds de Ecommerce

Script para poblar la base de datos con datos de prueba para un ecommerce.

## Datos Creados

### Business
- **TechStore Ecommerce** - UUID: `00000000-0000-0000-0000-000000000001`

### Inventory Locations
- WH-001: Almacén Principal (INTERNAL)
- SUPPLIER: Proveedor Genérico (SUPPLIER)
- CUSTOMER: Cliente Externo (CUSTOMER)
- TRANSIT: En Tránsito (TRANSIT)
- ADJUSTMENT: Ajuste de Inventario (ADJUSTMENT)

### Unit Measures (Sistema Americano)
- Unit (u), Piece (pc), Pound (lb), Ounce (oz), Gallon (gal), Liter (L), Milliliter (mL), Foot (ft), Inch (in), Box (box), Pack (pack), Dozen (dz), Kilogram (kg), Square Foot (sq ft)

### Categories (18)
1. Electronics
2. Clothing & Apparel
3. Home & Garden
4. Sports & Outdoors
5. Beauty & Personal Care
6. Toys & Games
7. Books & Media
8. Food & Beverages
9. Office Supplies
10. Automotive
11. Pet Supplies
12. Health & Wellness
13. Baby & Kids
14. Tools & Hardware
15. Luggage & Travel
16. Jewelry & Watches
17. Party & Events
18. Digital Products

### Products (90)
- 5 productos por cada categoría = 90 productos
- Todos tipo `storable` con `trackInventory: true`

### Inventory Moves
- 1 movimiento INBOUND por producto
- Estado: DONE
- Cantidades aleatorias (20-100 unidades)
- Fechas distribuidas en los últimos 15-75 días

## Uso

### 1. Configurar la base de datos
 Asegúrate de tener `DATABASE_URL` en tu `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nucleous
```

### 2. Ejecutar las migraciones
```bash
npm run db:push
```

### 3. Ejecutar los seeds
```bash
npm run db:seed
```

## Business ID

Después de ejecutar los seeds, usa este UUID como `businessId` en tus requests:

```
00000000-0000-0000-0000-000000000001
```

## Estructura del Seed

```
seeds/
└── ecommerce-seed.ts    # Script principal de seeds
```

## Notas

- Los datos usan `ON CONFLICT DO NOTHING`, así que puedes ejecutar los seeds múltiples veces sin duplicar
- Los timestamps están generados con fechas aleatorias en el pasado para tener histórico realista
- El UUID del business está fijo para poder referenciarlo fácilmente
