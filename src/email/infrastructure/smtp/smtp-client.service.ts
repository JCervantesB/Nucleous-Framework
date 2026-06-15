import { Injectable, Inject, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { EMAIL_CONFIG } from '../../application/email.tokens';
import { EmailConfig } from '../config/email.config';

interface EmailAddressInput {
  address: string;
  name?: string;
}

interface SendEmailInput {
  from: EmailAddressInput;
  to: EmailAddressInput[];
  cc?: EmailAddressInput[];
  bcc?: EmailAddressInput[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

@Injectable()
export class SmtpClientService {
  private readonly logger = new Logger(SmtpClientService.name);
  private transporter: Transporter | null = null;

  constructor(@Inject(EMAIL_CONFIG) private readonly config: EmailConfig) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const smtpConfig = this.config.getSmtpConfig();

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    this.logger.log(
      `SMTP transporter creado: ${smtpConfig.host}:${smtpConfig.port}`,
    );
  }

  async send(input: SendEmailInput): Promise<string> {
    if (!this.transporter) {
      throw new Error('SMTP transporter no inicializado');
    }

    const info = await this.transporter.sendMail({
      from: `"${input.from.name}" <${input.from.address}>`,
      to: input.to
        .map((t) => (t.name ? `"${t.name}" <${t.address}>` : t.address))
        .join(', '),
      cc: input.cc
        ?.map((c) => (c.name ? `"${c.name}" <${c.address}>` : c.address))
        .join(', '),
      bcc: input.bcc
        ?.map((b) => (b.name ? `"${b.name}" <${b.address}>` : b.address))
        .join(', '),
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });

    return info.messageId;
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      this.logger.error(`Error verificando conexión SMTP: ${error.message}`);
      return false;
    }
  }
}
