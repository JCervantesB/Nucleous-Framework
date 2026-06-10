import { EmailLog } from '../entities/email-log.entity';

export const EMAIL_LOG_REPOSITORY = Symbol('EmailLogRepository');

export interface ListEmailLogsOptions {
  businessId?: string;
  status?: string;
  to?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmailLogRepository {
  save(emailLog: EmailLog): Promise<EmailLog>;
  update(emailLog: EmailLog): Promise<EmailLog>;
  findById(id: string): Promise<EmailLog | null>;
  findByBusinessId(businessId: string, options?: ListEmailLogsOptions): Promise<PaginatedResult<EmailLog>>;
}