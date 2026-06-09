# Casos de Uso del Core

## Visión General

Los casos de uso contienen la **lógica de negocio** de la aplicación. Ellos:
- Son inyectados en controladores
- Usan interfaces de repositorio (no implementaciones)
- Retornan resultados tipados
- Manejan validación y reglas de negocio

## Patrón de Caso de Uso

```typescript
// Ubicación: src/core/domain/use-cases/create-business.use-case.ts

@Injectable()
export class CreateBusinessUseCase {
  constructor(
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepo: BusinessRepository,
  ) {}

  async execute(input: CreateBusinessInput): Promise<CreateBusinessOutput> {
    // Validación de negocio
    const existing = await this.businessRepo.findBySlug(input.slug);
    if (existing) {
      throw new Error('El slug ya está en uso');
    }

    // Crear entidad
    const business = Business.create({ ... });

    // Persistir
    const saved = await this.businessRepo.create(business);

    // Retornar resultado
    return { business: saved };
  }
}
```

## Casos de Uso Disponibles

### Business

| Caso de Uso | Archivo | Operaciones |
|------------|---------|-------------|
| `CreateBusinessUseCase` | `src/core/domain/use-cases/create-business.use-case.ts` | Crear nuevo negocio |
| `GetBusinessUseCase` | `src/core/domain/use-cases/get-business.use-case.ts` | Buscar negocio por ID |

### Contact

| Caso de Uso | Archivo | Operaciones |
|------------|---------|-------------|
| `CreateContactUseCase` | `src/core/domain/contacts/use-cases/create-contact.use-case.ts` | Crear contacto |
| `ListContactsUseCase` | `src/core/domain/contacts/use-cases/list-contacts.use-case.ts` | Listar con filtros |

### Activity

| Caso de Uso | Archivo | Operaciones |
|------------|---------|-------------|
| `CreateActivityUseCase` | `src/core/domain/activity/use-cases/create-activity.use-case.ts` | Crear actividad |
| `CompleteActivityUseCase` | `src/core/domain/activity/use-cases/complete-activity.use-case.ts` | Marcar como DONE |
| `ListActivitiesForRecordUseCase` | `src/core/domain/activity/use-cases/list-activities-for-record.use-case.ts` | Listar por registro |
| `ListActivitiesForUserUseCase` | `src/core/domain/activity/use-cases/list-activities-for-user.use-case.ts` | Listar por usuario |

### RecordEvent

| Caso de Uso | Archivo | Operaciones |
|------------|---------|-------------|
| `AddRecordEventUseCase` | `src/core/domain/record-event/use-cases/add-record-event.use-case.ts` | Agregar evento |
| `ListRecordEventsUseCase` | `src/core/domain/record-event/use-cases/list-record-events.use-case.ts` | Listar eventos |

### ConfigParameter

| Caso de Uso | Archivo | Operaciones |
|------------|---------|-------------|
| `GetConfigParameterUseCase` | `src/core/domain/config-parameter/use-cases/get-config-parameter.use-case.ts` | Obtener valor por key |
| `SetConfigParameterUseCase` | `src/core/domain/config-parameter/use-cases/set-config-parameter.use-case.ts` | Crear/actualizar |
| `ListConfigParametersUseCase` | `src/core/domain/config-parameter/use-cases/list-config-parameters.use-case.ts` | Listar todos |

## Ejemplo: CreateContactUseCase

```typescript
// src/core/domain/contacts/use-cases/create-contact.use-case.ts

interface CreateContactInput {
  businessId: string;
  name: string;
  type: 'PERSON' | 'COMPANY';
  email?: string;
  phone?: string;
  taxId?: string;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isEmployee?: boolean;
}

interface CreateContactOutput {
  contact: Contact;
}

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepo: ContactRepository,
  ) {}

  async execute(input: CreateContactInput): Promise<CreateContactOutput> {
    // Validación: verificar email único por negocio
    const existing = await this.contactRepo.findByEmail(input.email, input.businessId);
    if (existing) {
      throw new Error('El email ya está en uso');
    }

    // Crear entidad
    const contact = Contact.create({
      businessId: input.businessId,
      name: input.name,
      type: input.type,
      email: input.email ?? null,
      phone: input.phone ?? null,
      taxId: input.taxId ?? null,
      isCustomer: input.isCustomer ?? false,
      isSupplier: input.isSupplier ?? false,
      isEmployee: input.isEmployee ?? false,
    });

    // Persistir
    const saved = await this.contactRepo.create(contact);

    return { contact: saved };
  }
}
```

## Inyección de Dependencias

Los casos de uso se registran como **providers** en el módulo:

```typescript
// CoreModule providers (simplificado)
providers: [
  CreateBusinessUseCase,
  GetBusinessUseCase,
  CreateContactUseCase,
  ListContactsUseCase,
  // ...
]
```

Los controladores injectan casos de uso vía constructor:

```typescript
@Controller('core/business')
export class BusinessController {
  constructor(
    private readonly createBusinessUseCase: CreateBusinessUseCase,
    private readonly getBusinessUseCase: GetBusinessUseCase,
  ) {}
}
```

## Agregar un Nuevo Caso de Uso

1. Crear `src/core/domain/<entidad>/use-cases/<accion>.use-case.ts`
2. Definir interfaces de `Input` y `Output`
3. Marcar clase como `@Injectable()`
4. Injectar interfaz de repositorio vía `@Inject(REPOSITORIO_TOKEN)`
5. Implementar método `execute()` con lógica de negocio
6. Registrar en providers de `CoreModule`

## Manejo de Errores

Los casos de uso lanzan errores de dominio (instancias plain de `Error`). Los controladores capturan y convierten a respuestas HTTP:

```typescript
@Post()
async create(@Body() body: CreateDto) {
  try {
    const result = await this.createBusinessUseCase.execute({ ... });
    return result;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
```

## Validación de Negocio

La lógica de validación vive en los casos de uso, no en controladores o repositorios:
- Verificar constraints únicos (slug, email, etc.)
- Validar reglas de negocio
- Asegurar integridad referencial (dentro del alcance del dominio)