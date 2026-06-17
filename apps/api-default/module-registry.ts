import { type Type } from '@nestjs/common';
import { AiModule } from '../../src/ai/ai.module';
import { EmailModule } from '../../src/email/email.module';
import { StorageModule } from '../../src/storage/storage.module';
import { ProductsModule } from '../../src/products/products.module';
import { InventoryModule } from '../../src/inventory/inventory.module';
import { StockForecastModule } from '../../src/stock-forecast/stock-forecast.module';

export interface ModuleRegistryEntry {
  name: string;
  module: Type;
}

const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  { name: 'AI', module: AiModule },
  { name: 'EMAIL', module: EmailModule },
  { name: 'STORAGE', module: StorageModule },
  { name: 'PRODUCTS', module: ProductsModule },
  { name: 'INVENTORY', module: InventoryModule },
  { name: 'STOCK_FORECAST', module: StockForecastModule },
];

export const VALID_MODULES = MODULE_REGISTRY.map((m) => m.name);

export function getModulesToLoad(envModules: string[]): Type[] {
  return MODULE_REGISTRY.filter((entry) => envModules.includes(entry.name)).map(
    (entry) => entry.module,
  );
}

export function validateModules(modules: string[]): string[] {
  const invalid = modules.filter((m) => !VALID_MODULES.includes(m));
  if (invalid.length > 0) {
    throw new Error(
      `Módulos inválidos: ${invalid.join(', ')}. Válidos: ${VALID_MODULES.join(', ')}`,
    );
  }
  return modules;
}

export function getEnabledModules(): string[] {
  const envModules = (process.env.ENABLED_MODULES ?? '')
    .split(',')
    .map((m) => m.trim().toUpperCase())
    .filter(Boolean);

  if (envModules.length === 0) {
    return [...VALID_MODULES];
  }

  return envModules;
}
