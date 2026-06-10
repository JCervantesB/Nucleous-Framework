// apps/api-default/module-validator.ts

export const VALID_MODULES = [
  'AI',
] as const;

export type ValidModuleName = (typeof VALID_MODULES)[number];

export function validateEnabledModules(): void {
  const enabled = (process.env.ENABLED_MODULES ?? '')
    .split(',')
    .map((m) => m.trim().toUpperCase())
    .filter(Boolean);

  const invalid = enabled.filter((m) => !(VALID_MODULES as readonly string[]).includes(m));

  if (invalid.length > 0) {
    throw new Error(
      `Módulos inválidos: ${invalid.join(', ')}. Válidos: ${VALID_MODULES.join(', ')}`,
    );
  }
}

export function getEnabledModules(): string[] {
  return (process.env.ENABLED_MODULES ?? '')
    .split(',')
    .map((m) => m.trim().toUpperCase())
    .filter(Boolean);
}