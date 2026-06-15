export type EmailMode = 'smtp' | 'api';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface EmailModuleConfig {
  mode: EmailMode;
  smtp: SmtpConfig;
  defaults: {
    from: string;
    fromName: string;
  };
  rateLimit: {
    maxPerMinute: number;
  };
}

export class EmailConfig {
  private constructor(private readonly config: EmailModuleConfig) {}

  static fromEnv(): EmailConfig {
    const mode = (process.env.EMAIL_MODE as EmailMode) ?? 'smtp';
    const user = process.env.EMAIL_USER ?? process.env.EMAIL_AUTH_USER ?? '';
    const password =
      process.env.EMAIL_PASSWORD ?? process.env.EMAIL_AUTH_PASSWORD ?? '';

    if (!user) {
      throw new Error('EmailModule requiere EMAIL_USER');
    }

    if (!password) {
      throw new Error('EmailModule requiere EMAIL_PASSWORD');
    }

    return new EmailConfig({
      mode,
      smtp: {
        host: process.env.EMAIL_HOST ?? 'smtp.mailtrap.io',
        port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        user,
        password,
      },
      defaults: {
        from: process.env.EMAIL_FROM ?? 'noreply@nucleous.io',
        fromName: process.env.EMAIL_FROM_NAME ?? 'Nucleous Framework',
      },
      rateLimit: {
        maxPerMinute: parseInt(process.env.EMAIL_MAX_PER_MINUTE ?? '60', 10),
      },
    });
  }

  getMode(): EmailMode {
    return this.config.mode;
  }

  getSmtpConfig(): SmtpConfig {
    return this.config.smtp;
  }

  getDefaultFrom(): string {
    return this.config.defaults.from;
  }

  getDefaultFromName(): string {
    return this.config.defaults.fromName;
  }

  getRateLimit(): number {
    return this.config.rateLimit.maxPerMinute;
  }
}
