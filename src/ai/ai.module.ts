import { Module, Global } from '@nestjs/common';
import { AI_SERVICE, AI_CONFIG } from './application/ai.tokens';
import { AiService } from './application/ai.service';
import { AiConfig } from './infrastructure/config/ai.config';
import { AiSdkClient } from './infrastructure/clients/ai-sdk.client';
import { ModelRegistryService } from './infrastructure/clients/model-registry.service';
import { AiRateLimiterService } from './infrastructure/rate-limit/ai-rate-limiter.service';

@Global()
@Module({
  providers: [
    {
      provide: AI_CONFIG,
      useFactory: () => AiConfig.fromEnv(),
    },
    ModelRegistryService,
    AiRateLimiterService,
    AiSdkClient,
    AiService,
  ],
  exports: [AI_SERVICE, AI_CONFIG],
})
export class AiModule {
  static forRoot(config: Partial<AiConfig>) {
    return {
      module: AiModule,
      providers: [
        {
          provide: AI_CONFIG,
          useFactory: () => AiConfig.fromEnv(config),
        },
        ModelRegistryService,
        AiRateLimiterService,
        AiSdkClient,
        AiService,
      ],
      exports: [AI_SERVICE, AI_CONFIG],
    };
  }
}