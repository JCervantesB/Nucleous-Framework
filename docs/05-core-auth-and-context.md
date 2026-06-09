# Autenticación y Contexto del Core

## Visión General

El sistema de autenticación usa **Better Auth** (integrado via `@thallesp/nestjs-better-auth`) para manejar usuarios y sesiones. El contexto de negocio se resuelve con `CurrentBusinessService`.

## Better Auth Integration

### Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| `src/auth/better-auth.config.ts` | Configuración de Better Auth |
| `src/auth/auth.module.ts` | Módulo Nest que integra Better Auth |
| `src/auth/auth.controller.ts` | Controlador para manejar rutas auth |
| `src/auth/auth.guard.ts` | Guard para proteger endpoints |
| `src/auth/session.decorator.ts` | Decorador `@Session()` para obtener usuario |

### Configuración

```typescript
// src/auth/better-auth.config.ts
export const auth = betterAuth({
  database: {
    type: 'postgres',
    connectionString: process.env.DATABASE_URL,
  },
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
```

### AuthController

El controlador catch-all para Better Auth:

```typescript
// src/auth/auth.controller.ts

@Controller('auth')
export class AuthController {
  @Post('*path')
  async handleAuth(@Req() req: Request) {
    return auth.handler(req as any);
  }
}
```

**Endpoint:** `POST /auth/*path` - Todas las rutas de Better Auth

## AuthGuard

El guard valida que el usuario esté autenticado:

```typescript
// src/auth/auth.guard.ts

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.user === undefined) {
      throw new UnauthorizedException('No autorizado');
    }
    return true;
  }
}
```

**Uso:** Aplicar como guard global o en controladores específicos.

## Decorador @Session

Permite acceder al usuario actual en la request:

```typescript
// src/auth/session.decorator.ts

export const Session = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) return null;
    return data ? (user as Record<string, unknown>)[data] : user;
  },
);
```

### Uso en Controladores

```typescript
@Controller('core/activities')
export class ActivityController {
  @Post()
  async create(
    @Body() body: CreateActivityDto,
    @Session('userId') userId: string,  // Obtiene userId del usuario
  ) {
    // userId disponible para auditoría
  }
}
```

## CurrentBusinessService

Servicio que resuelve el `businessId` actual para operaciones multi-tenant.

```typescript
// src/core/application/current-business.service.ts

@Injectable()
export class CurrentBusinessService {
  private businessId: string | null = null;

  setBusinessId(businessId: string): void {
    this.businessId = businessId;
  }

  getBusinessId(): string {
    if (!this.businessId) {
      throw new Error('ID de negocio no establecido en el contexto');
    }
    return this.businessId;
  }

  clear(): void {
    this.businessId = null;
  }
}
```

### Uso

```typescript
// En un servicio o use case
const businessId = currentBusinessService.getBusinessId();
```

### Flujo de Contexto

```
Request HTTP
    ↓
AuthGuard valida sesión
    ↓
@Session() inyecta userId
    ↓
CurrentBusinessService.setBusinessId() desde token/header
    ↓
Use Case ejecuta con businessId
```

## Tokens de Inyección de Dependencias

El core define símbolos únicos para cada interfaz de repositorio:

```typescript
// Ejemplo: src/core/domain/repositories/business.repository.ts
export const BUSINESS_REPOSITORY = Symbol('BusinessRepository');
```

En `CoreModule` se mapean a implementaciones:

```typescript
providers: [
  {
    provide: BUSINESS_REPOSITORY,
    useClass: DrizzleBusinessRepository,
  },
  // ...
]
```

### Tokens Disponibles

| Token | Interfaz |
|-------|----------|
| `BUSINESS_REPOSITORY` | `BusinessRepository` |
| `CONTACT_REPOSITORY` | `ContactRepository` |
| `ACTIVITY_REPOSITORY` | `ActivityRepository` |
| `RECORD_EVENT_REPOSITORY` | `RecordEventRepository` |
| `CONFIG_PARAMETER_REPOSITORY` | `ConfigParameterRepository` |

## Módulo de Base de Datos

`DatabaseModule` es global y provee el token `'DB'`:

```typescript
// src/core/infrastructure/database/database.module.ts

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useValue: db,
    },
  ],
  exports: ['DB'],
})
export class DatabaseModule {}
```

Los repositorios Drizzle injectan este token:

```typescript
export class DrizzleBusinessRepository implements BusinessRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}
}
```

## Flujo de Autenticación Completo

1. **Registro/Login**: Better Auth maneja credenciales
2. **Sesión**: Cookie/token almacenado
3. **Request**: AuthGuard intercepta
4. **Contexto**: `@Session()` provee `userId`
5. **Negocio**: Use cases usan `userId` para auditoría

## Advertencias de Configuración

Better Auth muestra advertencia si no está configurado `baseURL`:

```
WARN: Base URL could not be determined. Please set a valid base URL using the baseURL config option or the BETTER_AUTH_URL environment variable.
```

Para resolver, setear variable de entorno:
```bash
BETTER_AUTH_URL=https://tu-dominio.com
```