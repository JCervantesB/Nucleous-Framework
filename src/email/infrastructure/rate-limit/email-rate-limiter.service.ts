import { Injectable, Inject, Logger } from '@nestjs/common';
import { EMAIL_CONFIG } from '../../application/email.tokens';
import { EmailConfig } from '../config/email.config';

@Injectable()
export class EmailRateLimiterService {
  private readonly logger = new Logger(EmailRateLimiterService.name);
  private readonly sentEmails: Map<string, number[]> = new Map();

  constructor(@Inject(EMAIL_CONFIG) private readonly config: EmailConfig) {}

  async checkLimit(businessId: string): Promise<boolean> {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxPerMinute = this.config.getRateLimit();

    const timestamps = this.sentEmails.get(businessId) ?? [];
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= maxPerMinute) {
      this.logger.warn(
        `Límite de rate limiting excedido para businessId: ${businessId}`,
      );
      return false;
    }

    validTimestamps.push(now);
    this.sentEmails.set(businessId, validTimestamps);
    return true;
  }

  reset(): void {
    this.sentEmails.clear();
  }
}
