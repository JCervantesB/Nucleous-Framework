import { ConfigParameterRepository } from '../config-parameter.repository.js';

export class ListConfigParametersUseCase {
  constructor(private readonly configRepo: ConfigParameterRepository) {}

  async execute(businessId?: string) {
    if (businessId) {
      const params = await this.configRepo.listByBusiness(businessId);
      return { data: params };
    }
    const params = await this.configRepo.listGlobal();
    return { data: params };
  }
}