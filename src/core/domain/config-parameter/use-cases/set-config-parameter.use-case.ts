import { ConfigParameter } from "../config-parameter.entity.js";
import { ConfigParameterRepository } from "../config-parameter.repository.js";

interface SetConfigParameterInput {
  key: string;
  value: string;
  businessId?: string;
  userId?: string;
}

interface SetConfigParameterOutput {
  configParameter: ConfigParameter;
}

export class SetConfigParameterUseCase {
  constructor(
    private readonly repo: ConfigParameterRepository,
  ) {}

  async execute(input: SetConfigParameterInput): Promise<SetConfigParameterOutput> {
    const param = ConfigParameter.create({
      key: input.key,
      value: input.value,
      businessId: input.businessId,
      createdBy: input.userId,
    });

    const saved = await this.repo.upsert(param);
    return { configParameter: saved };
  }
}