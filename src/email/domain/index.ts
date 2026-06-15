export {
  EmailLog,
  EmailStatus,
  type EmailLogProps,
} from './entities/email-log.entity';
export { EmailAddress } from './value-objects/email-address.value';
export { EmailContent } from './value-objects/email-content.value';
export {
  EMAIL_LOG_REPOSITORY,
  type EmailLogRepository,
  type ListEmailLogsOptions,
  type PaginatedResult,
} from './repositories/email-log.repository';
