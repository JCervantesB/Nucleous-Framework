import { Module, type Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { AiModule } from '../../src/ai/ai.module';
import { validateEnabledModules, getEnabledModules } from './module-validator';

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