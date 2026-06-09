import { Inject, Injectable } from '@nestjs/common';
import type { ConfigParameterRepository } from '../config-parameter.repository.js';
import { CONFIG_PARAMETER_REPOSITORY } from '../config-parameter.repository.js';

interface GetConfigParameterInput {
  key: string;
  businessId?: string;
}

@Injectable()
export class GetConfigParameterUseCase {
  constructor(
    @Inject(CONFIG_PARAMETER_REPOSITORY)
    private readonly repo: ConfigParameterRepository,
  ) {}

  async execute(
    input: GetConfigParameterInput,
  ): Promise<{ value: string | null }> {
    const param = await this.repo.findByKey(input.key, input.businessId);
    return { value: param?.value ?? null };
  }
}
