export { EmailModule } from './email.module';
export {
  EmailService,
  type SendEmailOptions,
  type SendEmailResult,
} from './application/email.service';
export {
  SendEmailUseCase,
  type SendEmailInput,
  type SendEmailOutput,
} from './application/use-cases/send-email.use-case';
export {
  SendTemplateEmailUseCase,
  type TemplateEmailInput,
} from './application/use-cases/send-template-email.use-case';
export {
  GetEmailLogsUseCase,
  type GetEmailLogsInput,
  type GetEmailLogsOutput,
} from './application/use-cases/get-email-logs.use-case';
export {
  EMAIL_LOG_REPOSITORY,
  type EmailLogRepository,
  type ListEmailLogsOptions,
  type PaginatedResult,
} from './domain/repositories/email-log.repository';
export {
  EmailLog,
  EmailStatus,
  type EmailLogProps,
} from './domain/entities/email-log.entity';
export { EmailAddress } from './domain/value-objects/email-address.value';
export { EmailContent } from './domain/value-objects/email-content.value';
export {
  EmailConfig,
  type EmailModuleConfig,
  type SmtpConfig,
  type EmailMode,
} from './infrastructure/config/email.config';
