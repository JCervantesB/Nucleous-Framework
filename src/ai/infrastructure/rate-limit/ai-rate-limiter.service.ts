import { Injectable, Inject } from '@nestjs/common';
import { AI_CONFIG } from '../../application/ai.tokens';
import { AiConfig } from '../config/ai.config';
import { AiRateLimitExceededException } from './ai-rate-limiter.exception';

@Injectable()
export class AiRateLimiterService {
  private requestLog: Map<string, number[]> = new Map();

  constructor(@Inject(AI_CONFIG) private readonly config: AiConfig) {}

  checkLimit(provider: string, modelAlias: string): void {
    const providerLimit = this.config.getRateLimitForProvider(provider);
    const aliasLimit = this.config.getRateLimitForModelAlias(modelAlias);

    if (providerLimit) {
      this.checkWindow(provider, providerLimit);
    }

    if (aliasLimit) {
      this.checkWindow(modelAlias, aliasLimit);
    }
  }

  recordRequest(provider: string, modelAlias: string): void {
    const providerLimit = this.config.getRateLimitForProvider(provider);
    const aliasLimit = this.config.getRateLimitForModelAlias(modelAlias);

    if (providerLimit) {
      this.addRequest(provider, providerLimit.windowMs);
    }

    if (aliasLimit) {
      this.addRequest(modelAlias, aliasLimit.windowMs);
    }
  }

  private checkWindow(
    key: string,
    limit: { maxRequests: number; windowMs: number },
  ): void {
    const now = Date.now();
    const timestamps = this.requestLog.get(key) ?? [];
    const validTimestamps = timestamps.filter((t) => now - t < limit.windowMs);

    if (validTimestamps.length >= limit.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const retryAfterMs = limit.windowMs - (now - oldestTimestamp);

      throw new AiRateLimitExceededException(
        Math.max(0, retryAfterMs),
        key,
        key,
      );
    }
  }

  private addRequest(key: string, windowMs: number): void {
    const now = Date.now();
    const timestamps = this.requestLog.get(key) ?? [];
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);
    validTimestamps.push(now);
    this.requestLog.set(key, validTimestamps);
  }

  reset(): void {
    this.requestLog.clear();
  }
}
