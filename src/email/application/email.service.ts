import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EMAIL_CONFIG, EMAIL_SMTP_CLIENT, EMAIL_RATE_LIMITER } from './email.tokens';
import { EmailConfig } from '../infrastructure/config/email.config';
import { SmtpClientService } from '../infrastructure/smtp/smtp-client.service';
import { EmailRateLimiterService } from '../infrastructure/rate-limit/email-rate-limiter.service';
import { EmailAddress } from '../domain/value-objects/email-address.value';

export interface SendEmailOptions {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  businessId?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  provider: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EMAIL_CONFIG) private readonly config: EmailConfig,
    @Inject(EMAIL_SMTP_CLIENT) private readonly smtpClient: SmtpClientService,
    @Inject(EMAIL_RATE_LIMITER) private readonly rateLimiter: EmailRateLimiterService,
  ) {}

  onModuleInit() {
    this.logger.log('EmailService inicializado');
    this.logger.log(`SMTP: ${this.config.getSmtpConfig().host}:${this.config.getSmtpConfig().port}`);
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const businessId = options.businessId ?? 'global';

    const allowed = await this.rateLimiter.checkLimit(businessId);
    if (!allowed) {
      throw new Error('Límite de rate limiting excedido. Intenta más tarde.');
    }

    const from = options.from ?? this.config.getDefaultFrom();
    const fromName = options.fromName ?? this.config.getDefaultFromName();

    try {
      const messageId = await this.smtpClient.send({
        from: { address: from, name: fromName },
        to: options.to.map(t => ({ address: t.email, name: t.name })),
        cc: options.cc?.map(c => ({ address: c.email, name: c.name })),
        bcc: options.bcc?.map(b => ({ address: b.email, name: b.name })),
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
      });

      this.logger.log(`Email enviado: ${messageId}`);
      return { success: true, messageId, provider: 'smtp' };
    } catch (error) {
      this.logger.error(`Error enviando email: ${error.message}`);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    return this.smtpClient.verifyConnection();
  }
}