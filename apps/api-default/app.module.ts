import { Module, type Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module.js';
import { AuthModule } from '../../src/auth/auth.module.js';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module.js';
import { AiModule } from '../../src/ai/ai.module.js';
import { validateEnabledModules, getEnabledModules } from './module-validator.js';

validateEnabledModules();

const enabledModules = getEnabledModules();

const imports: Type<any>[] = [
  DatabaseModule,
  AuthModule,
  CoreModule,
];

if (enabledModules.includes('AI')) {
  imports.push(AiModule);
}

@Module({
  imports,
})
export class AppModule {}