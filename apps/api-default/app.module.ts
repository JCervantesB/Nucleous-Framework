import 'dotenv/config';
import { Module, type Type } from '@nestjs/common';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseModule } from '../../src/core/infrastructure/database/database.module';
import {
  getModulesToLoad,
  validateModules,
  getEnabledModules,
} from './module-registry';

const enabledModules = getEnabledModules();

validateModules(enabledModules);

const dynamicModules: Type[] = getModulesToLoad(enabledModules);

console.log(`Módulos cargados: [${enabledModules.join(', ')}]`);

@Module({
  imports: [DatabaseModule, AuthModule, CoreModule, ...dynamicModules],
})
export class AppModule {}
