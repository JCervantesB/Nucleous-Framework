import { type Type } from '@nestjs/common';
import { AiModule } from '../../src/ai/ai.module';
import { EmailModule } from '../../src/email/email.module';
import { StorageModule } from '../../src/storage/storage.module';

export interface ModuleRegistryEntry {
  name: string;
  module: Type;
}

// Registro centralizado de módulos disponibles
const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  { name: 'AI', module: AiModule },
  { name: 'EMAIL', module: EmailModule },
  { name: 'STORAGE', module: StorageModule },
];

export const VALID_MODULES = MODULE_REGISTRY.map(m => m.name);

export function getModulesToLoad(envModules: string[]): Type[] {
  return MODULE_REGISTRY
    .filter(entry => envModules.includes(entry.name))
    .map(entry => entry.module);
}

export function validateModules(modules: string[]): string[] {
  const invalid = modules.filter(m => !VALID_MODULES.includes(m));
  if (invalid.length > 0) {
    throw new Error(
      `Módulos inválidos: ${invalid.join(', ')}. Válidos: ${VALID_MODULES.join(', ')}`,
    );
  }
  return modules;
}