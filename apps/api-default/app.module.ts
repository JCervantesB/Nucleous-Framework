import 'dotenv/config';
import { Module, type Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import { getModulesToLoad, validateModules } from './module-registry';

const envModules = (process.env.ENABLED_MODULES ?? '')
  .split(',')
  .map((m) => m.trim().toUpperCase())
  .filter(Boolean);

validateModules(envModules);

const enabledModules = envModules;
const dynamicModules: Type[] = getModulesToLoad(enabledModules);

console.log(
  `Módulos detectados en ENABLED_MODULES: [${enabledModules.join(', ')}]`,
);

@Module({
  imports: [DatabaseModule, AuthModule, CoreModule, ...dynamicModules],
})
export class AppModule {}
