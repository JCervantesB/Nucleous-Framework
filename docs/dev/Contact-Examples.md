# Ejemplos de Uso - Contactos

## 1. Crear un Cliente (CRM)

```http
POST /api/v1/core/contacts
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Juan",
  "lastName": "Pérez García",
  "email": "juan.perez@email.com",
  "phone": "+5212345678900",
  "isCustomer": true
}
```

**Respuesta:**
```json
{
  "id": "uuid-del-contacto",
  "firstName": "Juan",
  "lastName": "Pérez García",
  "email": "juan.perez@email.com",
  "phone": "+5212345678900",
  "isCustomer": true,
  "isSupplier": false,
  "isEmployee": false,
  "createdAt": "2026-06-15T10:00:00.000Z"
}
```

---

## 2. Listar Solo Clientes

```http
GET /api/v1/core/contacts?role=customer
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "firstName": "Juan",
      "lastName": "Pérez García",
      "email": "juan.perez@email.com",
      "isCustomer": true,
      "isSupplier": false,
      "isEmployee": false
    },
    {
      "id": "uuid-2",
      "firstName": "María",
      "lastName": "López Santos",
      "email": "maria.lopez@email.com",
      "isCustomer": true,
      "isSupplier": false,
      "isEmployee": false
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

---

## 3. Buscar Clientes con Filtros

```http
GET /api/v1/core/contacts?role=customer&search=Juan&page=1&pageSize=10
Authorization: Bearer <token>
```

---

## 4. Actualizar Cliente a Proveedor

Un contacto puede tener múltiples roles. Actualicemos un cliente para que también sea proveedor:

```http
PATCH /api/v1/core/contacts/{contactId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "isSupplier": true
}
```

**Respuesta:**
```json
{
  "id": "uuid-del-contacto",
  "firstName": "Juan",
  "lastName": "Pérez García",
  "email": "juan.perez@email.com",
  "isCustomer": true,
  "isSupplier": true,
  "isEmployee": false,
  "updatedAt": "2026-06-15T12:00:00.000Z"
}
```

---

## 5. Crear un Empleado (HR)

```http
POST /api/v1/core/contacts
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Carlos",
  "lastName": "Martínez López",
  "email": "carlos.martinez@empresa.com",
  "phone": "+5212345678901",
  "isEmployee": true
}
```

**Respuesta:**
```json
{
  "id": "uuid-del-empleado",
  "firstName": "Carlos",
  "lastName": "Martínez López",
  "email": "carlos.martinez@empresa.com",
  "phone": "+5212345678901",
  "isCustomer": false,
  "isSupplier": false,
  "isEmployee": true,
  "createdAt": "2026-06-15T10:00:00.000Z"
}
```

---

## 6. Listar Solo Empleados

```http
GET /api/v1/core/contacts?role=employee
Authorization: Bearer <token>
```

---

## 7. Crear un Proveedor

```http
POST /api/v1/core/contacts
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Acme",
  "lastName": "Corporation",
  "email": "ventas@acme.com",
  "phone": "+5212345678902",
  "isSupplier": true
}
```

---

## 8. Listar Solo Proveedores

```http
GET /api/v1/core/contacts?role=supplier
Authorization: Bearer <token>
```

---

## 9. Uso en Módulos de Negocio

### Módulo CRM (Clientes)

El módulo de CRM filtra contactos donde `isCustomer = true`:

```typescript
// Ejemplo: En un módulo CRM futuro
const customers = await listContactsUseCase.execute({
  businessId,
  options: { isCustomer: true }
});
```

### Módulo HR (Empleados)

El módulo de HR filtra contactos donde `isEmployee = true`:

```typescript
// Ejemplo: En un módulo HR futuro
const employees = await listContactsUseCase.execute({
  businessId,
  options: { isEmployee: true }
});
```

### Módulo Purchases (Proveedores)

El módulo de Purchases filtra contactos donde `isSupplier = true`:

```typescript
// Ejemplo: En un módulo Purchases futuro
const suppliers = await listContactsUseCase.execute({
  businessId,
  options: { isSupplier: true }
});
```

---

## 10. Caso: Contacto que es Cliente y Empleado

Algunos contactos pueden tener múltiples roles. Por ejemplo, un empleado que también es cliente del negocio:

```http
POST /api/v1/core/contacts
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Ana",
  "lastName": "Ramírez Torres",
  "email": "ana.ramirez@empresa.com",
  "isCustomer": true,
  "isEmployee": true
}
```

**Respuesta:**
```json
{
  "id": "uuid-ana",
  "firstName": "Ana",
  "lastName": "Ramírez Torres",
  "email": "ana.ramirez@empresa.com",
  "isCustomer": true,
  "isSupplier": false,
  "isEmployee": true,
  "createdAt": "2026-06-15T10:00:00.000Z"
}
```

---

## Resumen de Flags

| Caso de Uso | isCustomer | isSupplier | isEmployee |
|-------------|------------|------------|------------|
| Cliente simple | true | false | false |
| Proveedor simple | false | true | false |
| Empleado simple | false | false | true |
| Cliente y proveedor | true | true | false |
| Cliente y empleado | true | false | true |
| Empresa (sin rol) | false | false | false |

---

## Próximos Pasos

- [ ] Agregar direcciones al contacto (`contact_address`)
- [ ] Agregar histórico de cambios de rol
- [ ] Agregar notas y categorías
- [ ] Agregar integración con módulo de facturación
