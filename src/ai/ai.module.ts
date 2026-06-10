import { Module, Global } from '@nestjs/common';
import { AI_SERVICE, AI_SDK_CLIENT, AI_MODEL_REGISTRY, AI_RATE_LIMITER, AI_CONFIG } from './application/ai.tokens';
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
    {
      provide: AI_SERVICE,
      useClass: AiService,
    },
    {
      provide: AI_SDK_CLIENT,
      useClass: AiSdkClient,
    },
    {
      provide: AI_MODEL_REGISTRY,
      useClass: ModelRegistryService,
    },
    {
      provide: AI_RATE_LIMITER,
      useClass: AiRateLimiterService,
    },
  ],
  exports: [AI_SERVICE, AI_CONFIG, AI_SDK_CLIENT, AI_MODEL_REGISTRY, AI_RATE_LIMITER],
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
        {
          provide: AI_SERVICE,
          useClass: AiService,
        },
        {
          provide: AI_SDK_CLIENT,
          useClass: AiSdkClient,
        },
        {
          provide: AI_MODEL_REGISTRY,
          useClass: ModelRegistryService,
        },
        {
          provide: AI_RATE_LIMITER,
          useClass: AiRateLimiterService,
        },
      ],
      exports: [AI_SERVICE, AI_CONFIG, AI_SDK_CLIENT, AI_MODEL_REGISTRY, AI_RATE_LIMITER],
    };
  }
}