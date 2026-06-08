import { ConfigParameterRepository } from "../config-parameter.repository.js";

interface GetConfigParameterInput {
  key: string;
  businessId?: string;
}

export class GetConfigParameterUseCase {
  constructor(
    private readonly repo: ConfigParameterRepository,
  ) {}

  async execute(input: GetConfigParameterInput): Promise<{ value: string | null }> {
    const param = await this.repo.findByKey(input.key, input.businessId);
    return { value: param?.value ?? null };
  }
}