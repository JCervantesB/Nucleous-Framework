import { Injectable, Inject } from '@nestjs/common';
import { EMAIL_LOG_REPOSITORY, type EmailLogRepository, type ListEmailLogsOptions, type PaginatedResult } from '../../domain/repositories/email-log.repository';
import { EmailLog } from '../../domain/entities/email-log.entity';

export interface GetEmailLogsInput extends ListEmailLogsOptions {}

export interface GetEmailLogsOutput extends PaginatedResult<EmailLog> {}

@Injectable()
export class GetEmailLogsUseCase {
  constructor(
    @Inject(EMAIL_LOG_REPOSITORY) private readonly emailLogRepo: EmailLogRepository,
  ) {}

  async execute(input: GetEmailLogsInput): Promise<GetEmailLogsOutput> {
    if (!input.businessId) {
      throw new Error('Se requiere businessId para consultar logs de email');
    }

    return this.emailLogRepo.findByBusinessId(input.businessId, input);
  }
}