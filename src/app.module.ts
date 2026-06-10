import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './core/infrastructure/database/database.module.js';
import { AiModule } from './ai/ai.module.js';

@Module({
  imports: [DatabaseModule, AuthModule, CoreModule, AiModule],
})
export class AppModule {}
