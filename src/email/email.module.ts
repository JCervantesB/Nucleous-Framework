import { Module, Global } from '@nestjs/common';
import {
  EMAIL_SERVICE,
  EMAIL_CONFIG,
  EMAIL_SMTP_CLIENT,
  EMAIL_LOG_REPOSITORY,
  EMAIL_RATE_LIMITER,
  SEND_EMAIL_USE_CASE,
} from './application/email.tokens';
import { EmailService } from './application/email.service';
import { EmailConfig } from './infrastructure/config/email.config';
import { SmtpClientService } from './infrastructure/smtp/smtp-client.service';
import { EmailRateLimiterService } from './infrastructure/rate-limit/email-rate-limiter.service';
import { DrizzleEmailLogRepository } from './infrastructure/persistence/drizzle-email-log.repository';
import { SendEmailUseCase } from './application/use-cases/send-email.use-case';
import { SendTemplateEmailUseCase } from './application/use-cases/send-template-email.use-case';
import { GetEmailLogsUseCase } from './application/use-cases/get-email-logs.use-case';
import { RetryEmailUseCase } from './application/use-cases/retry-email.use-case';
import { EmailController } from './interfaces/http/email.controller';

@Global()
@Module({
  controllers: [EmailController],
  providers: [
    {
      provide: EMAIL_CONFIG,
      useFactory: () => EmailConfig.fromEnv(),
    },
    {
      provide: EMAIL_SMTP_CLIENT,
      useClass: SmtpClientService,
    },
    {
      provide: EMAIL_RATE_LIMITER,
      useClass: EmailRateLimiterService,
    },
    {
      provide: EMAIL_LOG_REPOSITORY,
      useClass: DrizzleEmailLogRepository,
    },
    {
      provide: EMAIL_SERVICE,
      useClass: EmailService,
    },
    {
      provide: SEND_EMAIL_USE_CASE,
      useClass: SendEmailUseCase,
    },
    SendEmailUseCase,
    SendTemplateEmailUseCase,
    GetEmailLogsUseCase,
    RetryEmailUseCase,
  ],
  exports: [
    EMAIL_SERVICE,
    EMAIL_CONFIG,
    EMAIL_SMTP_CLIENT,
    EMAIL_LOG_REPOSITORY,
    EMAIL_RATE_LIMITER,
    SEND_EMAIL_USE_CASE,
    SendEmailUseCase,
    SendTemplateEmailUseCase,
    GetEmailLogsUseCase,
    RetryEmailUseCase,
  ],
})
export class EmailModule {}