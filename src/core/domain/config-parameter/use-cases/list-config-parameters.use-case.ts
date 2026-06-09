import { Inject, Injectable } from '@nestjs/common';
import type { ConfigParameterRepository } from '../config-parameter.repository.js';
import { CONFIG_PARAMETER_REPOSITORY } from '../config-parameter.repository.js';

@Injectable()
export class ListConfigParametersUseCase {
  constructor(
    @Inject(CONFIG_PARAMETER_REPOSITORY)
    private readonly configRepo: ConfigParameterRepository,
  ) {}

  async execute(businessId?: string) {
    if (businessId) {
      const params = await this.configRepo.listByBusiness(businessId);
      return { data: params };
    }
    const params = await this.configRepo.listGlobal();
    return { data: params };
  }
}
