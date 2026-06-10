# Email Module - Visión General

## Descripción

El **EmailModule** es un módulo transversal opcional de Nucleous Framework que proporciona capacidades de envío de emails a través de cualquier proveedor SMTP.

## Características

- **Envío via SMTP**: Compatible con cualquier proveedor (Mailtrap, Gmail, SendGrid, Mailgun, AWS SES)
- **Logging de emails**: Registra todos los emails enviados con estado (PENDING, SENT, FAILED)
- **Rate limiting**: Control de velocidad por businessId para evitar saturación
- **Multi-tenant**: Aislamiento por `businessId`
- **Plantillas**: Soporte para emails con datos dinámicos

## Arquitectura

```
src/email/
├── domain/                          # Lógica pura
│   ├── entities/email-log.entity.ts
│   ├── value-objects/
│   │   ├── email-address.value.ts
│   │   └── email-content.value.ts
│   └── repositories/email-log.repository.ts
│
├── application/                      # Servicios
│   ├── email.service.ts              # Fachada principal
│   ├── email.tokens.ts               # Símbolos DI
│   └── use-cases/
│       ├── send-email.use-case.ts
│       ├── send-template-email.use-case.ts
│       └── get-email-logs.use-case.ts
│
├── infrastructure/                   # Implementaciones
│   ├── config/email.config.ts        # Configuración SMTP
│   ├── smtp/smtp-client.service.ts   # Cliente Nodemailer
│   ├── rate-limit/email-rate-limiter.service.ts
│   └── persistence/drizzle-email-log.repository.ts
│
└── email.module.ts                   # Definición del módulo
```

## Habilitación

### 1. Agregar EMAIL a VALID_MODULES

```typescript
// apps/api-default/module-validator.ts

export const VALID_MODULES = [
  'AI',
  'EMAIL',  // ← Agregar EMAIL
] as const;

export type ValidModuleName = (typeof VALID_MODULES)[number];
```

### 2. Importar condicionalmente en AppModule

```typescript
// apps/api-default/app.module.ts

import { Module, type Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { AiModule } from '../../src/ai/ai.module';
import { EmailModule } from '../../src/email/email.module';  // ← Importar
import { validateEnabledModules, getEnabledModules } from './module-validator';

validateEnabledModules();
const enabledModules = getEnabledModules();

const imports: Type<any>[] = [
  DatabaseModule,
  AuthModule,
  CoreModule,
];

if (enabledModules.includes('AI')) {
  imports.push(AiModule);
}

if (enabledModules.includes('EMAIL')) {  // ← Condicional
  imports.push(EmailModule);
}

@Module({ imports })
export class AppModule {}
```

### 3. Configurar variables de entorno

Ver sección de Variables de Entorno abajo.

## Variables de Entorno

```env
# Habilitar módulo
ENABLED_MODULES=AI,EMAIL

# Configuración SMTP
EMAIL_ENABLED=true
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_usuario
EMAIL_PASSWORD=tu_password
EMAIL_FROM=noreply@tudominio.com
EMAIL_FROM_NAME=Nombre del Sender

# Rate limiting (opcional)
EMAIL_MAX_PER_MINUTE=60
```

## Proveedores Compatibles

| Proveedor | Host | Notas |
|-----------|------|-------|
| Mailtrap | `smtp.mailtrap.io` | Desarrollo/pruebas |
| Gmail | `smtp.gmail.com` | Requiere App Password |
| SendGrid | `smtp.sendgrid.net` | SMTP relay |
| Mailgun | `smtp.mailgun.org` | Credenciales del dashboard |
| AWS SES | `email-smtp.us-east-1.amazonaws.com` | Credenciales IAM |

## Uso Básico

```typescript
import { SendEmailUseCase } from './email/application/use-cases/send-email.use-case';

@Injectable()
class MiServicio {
  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {}

  async enviarNotificacion() {
    await this.sendEmailUseCase.execute({
      businessId: 'uuid-del-negocio',
      to: 'destinatario@example.com',
      subject: 'Notificación',
      body: 'Mensaje de prueba',
    });
  }
}
```

## Flujo de un Email

```
SendEmailUseCase
    │
    ├──► EmailLogRepository.save() → Estado: PENDING
    │
    ├──► EmailRateLimiterService.checkLimit()
    │
    ├──► SmtpClientService.send()
    │         │
    │         ▼
    │    ┌─────────────┐
    │    │   SMTP      │
    │    │  Provider   │
    │    └─────────────┘
    │
    └──► EmailLogRepository.update() → Estado: SENT o FAILED
```

## Integración con Módulos de Negocio

Los módulos de negocio (inventory, customers, etc.) deben usar `EmailService` o `SendEmailUseCase`, **nunca llamar directo al SmtpClientService**.

```typescript
// ✅ CORRECTO - Usa la fachada
import { EmailService } from './email/email.service';

@Injectable()
class InventoryService {
  constructor(private readonly emailService: EmailService) {}

  async notifyLowStock(product: Product) {
    await this.emailService.send({
      to: [{ email: product.managerEmail }],
      subject: `Stock bajo: ${product.name}`,
      text: `El producto tiene stock de ${product.stock} unidades.`,
    });
  }
}

// ❌ INCORRECTO - Acoplamiento directo a infraestructura
// No hacer esto nunca:
import { SmtpClientService } from './email/infrastructure/smtp/smtp-client.service';
```