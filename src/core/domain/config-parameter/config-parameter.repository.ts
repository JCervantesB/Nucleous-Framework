import { ConfigParameter } from './config-parameter.entity.js';

export const CONFIG_PARAMETER_REPOSITORY = Symbol('ConfigParameterRepository');

export interface ConfigParameterRepository {
  upsert(param: ConfigParameter): Promise<ConfigParameter>;
  findByKey(key: string, businessId?: string): Promise<ConfigParameter | null>;
  listByBusiness(businessId: string): Promise<ConfigParameter[]>;
  listGlobal(): Promise<ConfigParameter[]>;
}
