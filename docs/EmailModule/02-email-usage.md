# Email Module - Uso

## Envío de Emails

### Uso Básico con Use Case

```typescript
import { SendEmailUseCase, type SendEmailInput } from './email/application/use-cases/send-email.use-case';

@Injectable()
class OrderService {
  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {}

  async confirmOrder(orderId: string) {
    const result = await this.sendEmailUseCase.execute({
      businessId: 'uuid-del-negocio',
      to: 'cliente@example.com',
      subject: 'Confirmación de pedido',
      body: `Tu pedido ${orderId} ha sido confirmado.`,
      bodyHtml: `<p>Tu pedido <strong>${orderId}</strong> ha sido confirmado.</p>`,
    });

    if (!result.success) {
      console.error('Error enviando email:', result.error);
    }
  }
}
```

### Múltiples Destinatarios

```typescript
await sendEmailUseCase.execute({
  businessId: 'uuid-del-negocio',
  to: ['cliente@example.com', 'cliente2@example.com'],
  cc: ['vendedor@example.com'],
  bcc: ['admin@example.com'],
  subject: 'Notificación',
  body: 'Mensaje para múltiples personas',
});
```

### Personalización del Remitente

```typescript
await sendEmailUseCase.execute({
  businessId: 'uuid-del-negocio',
  to: 'destinatario@example.com',
  from: 'ventas@miempresa.com',
  fromName: 'Equipo de Ventas',
  replyTo: 'soporte@miempresa.com',
  subject: 'Asunto',
  body: 'Mensaje',
});
```

## Uso del EmailService Directo

Para casos donde no necesitas logging (ej: notificaciones internas):

```typescript
import { EmailService, EmailAddress } from './email';

@Injectable()
class ProductService {
  constructor(private readonly emailService: EmailService) {}

  async notifyLowStock(product: Product) {
    const to = EmailAddress.create(product.managerEmail, product.managerName);

    await this.emailService.send({
      to: [to],
      subject: `Stock bajo: ${product.name}`,
      text: `El producto ${product.name} tiene solo ${product.stock} unidades.`,
      html: `<p>El producto <strong>${product.name}</strong> tiene solo ${product.stock} unidades.</p>`,
      businessId: product.businessId,
    });
  }
}
```

## Plantillas de Email

### Envío con Plantilla

```typescript
import { SendTemplateEmailUseCase } from './email/application/use-cases/send-template-email.use-case';

await sendTemplateEmailUseCase.execute({
  businessId: 'uuid-del-negocio',
  to: 'cliente@example.com',
  subject: 'Bienvenido',
  body: 'Hola {{name}}, bienvenido a {{company}}.',
  templateId: 'welcome-email',
  templateData: {
    name: 'Juan',
    company: 'Mi Empresa',
  },
});
```

### Sistema de Plantillas

El `SendTemplateEmailUseCase` soporta interpolación de variables con formato `{{variableName}}`:

```typescript
// Template
"Hola {{name}}, tu pedido #{{orderId}} está listo para recoger."

// Data
{ name: "Juan", orderId: "12345" }

// Resultado
"Hola Juan, tu pedido #12345 está listo para recoger."
```

## Consulta de Logs

```typescript
import { GetEmailLogsUseCase } from './email/application/use-cases/get-email-logs.use-case';

@Injectable()
class EmailAdminService {
  constructor(private readonly getEmailLogsUseCase: GetEmailLogsUseCase) {}

  async getEmailHistory(businessId: string) {
    const logs = await this.getEmailLogsUseCase.execute({
      businessId,
      page: 1,
      pageSize: 20,
    });

    console.log(`Total: ${logs.total} emails`);
    logs.data.forEach(log => {
      console.log(`${log.createdAt} - ${log.to} - ${log.status}`);
    });
  }

  async getFailedEmails(businessId: string) {
    const logs = await this.getEmailLogsUseCase.execute({
      businessId,
      status: 'FAILED',
    });

    return logs.data;
  }
}
```

## Estados de un Email

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Email creado, esperando envío |
| `SENT` | Email enviado exitosamente |
| `FAILED` | Error durante el envío |
| `BOUNCED` | Email rechazado por el servidor destino |

## Rate Limiting

El módulo implementa rate limiting por `businessId` para evitar saturación del servidor SMTP.

```env
# Por defecto: 60 emails por minuto
EMAIL_MAX_PER_MINUTE=60
```

Si se excede el límite, se lanza un error:
```
Error: Límite de rate limiting excedido. Intenta más tarde.
```

## Verificación de Conexión SMTP

```typescript
import { EmailService } from './email';

@Injectable()
class HealthCheckService {
  constructor(private readonly emailService: EmailService) {}

  async checkEmailConnection(): Promise<boolean> {
    return this.emailService.verifyConnection();
  }
}
```

## Ejemplo: Notificación de Stock Bajo

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { SendEmailUseCase } from './email/application/use-cases/send-email.use-case';
import { ProductRepository } from './inventory/domain/repositories/product.repository';

@Injectable()
export class StockNotificationService {
  constructor(
    private readonly sendEmailUseCase: SendEmailUseCase,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
  ) {}

  async checkAndNotify(productId: string) {
    const product = await this.productRepo.findById(productId);

    if (product.stock <= product.minStock) {
      await this.sendEmailUseCase.execute({
        businessId: product.businessId,
        to: product.managerEmail,
        subject: `⚠️ Stock bajo: ${product.name}`,
        body: `
El producto "${product.name}" ha alcanzado un nivel de stock crítico.

Stock actual: ${product.stock}
Stock mínimo: ${product.minStock}

Por favor, revisa el inventario.
        `.trim(),
        html: `
<table style="border: 1px solid #ddd; padding: 10px;">
  <tr><td><strong>Producto</strong></td><td>${product.name}</td></tr>
  <tr><td><strong>Stock actual</strong></td><td>${product.stock}</td></tr>
  <tr><td><strong>Stock mínimo</strong></td><td>${product.minStock}</td></tr>
</table>
        `.trim(),
      });
    }
  }
}
```

## Ejemplo: Notificación Robusta con EmailService

Para uso directo con `EmailService` (sin logging en BD), incluyendo manejo de errores y validación:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { EmailService, EmailAddress } from './email/email.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly emailService: EmailService) {}

  async notifyLowStock(product: Product): Promise<void> {
    try {
      const to = EmailAddress.create(product.managerEmail, product.managerName);

      await this.emailService.send({
        to: [to],
        subject: `Stock bajo: ${product.name}`,
        text: `El producto tiene stock de ${product.stock} unidades.`,
        html: `<p>El producto <strong>${product.name}</strong> tiene solo ${product.stock} unidades.</p>`,
        businessId: product.businessId,
      });

      this.logger.log(`Notificación de stock bajo enviada a ${product.managerEmail}`);
    } catch (error) {
      this.logger.error(`Error enviando notificación de stock: ${error.message}`);
      // No propagar - no bloqueamos el proceso principal por fallo de email
    }
  }
}
```

**Puntos clave del ejemplo robusto:**

- **Try-catch**: Maneja errores sin propagarlos al proceso llamador
- **EmailAddress.create()**: Valida el email antes de enviar
- **businessId**: Necesario para multi-tenant
- **Logger**: Registra éxito o fracaso para debugging