import { Injectable } from '@nestjs/common';
import { DEFAULT_MODELS, type ModelAlias } from '../../ai.types';

@Injectable()
export class ModelRegistryService {
  private providerToModel: Map<string, string> = new Map();
  private aliasToModel: Map<ModelAlias, string> = new Map();
  private defaultProvider: string = 'openrouter';
  private defaultModelAlias: ModelAlias = 'reasoning';

  registerDefaultModels() {
    this.providerToModel.set('openrouter', DEFAULT_MODELS.reasoning);
    this.providerToModel.set('openai', DEFAULT_MODELS.fast);

    for (const [alias, model] of Object.entries(DEFAULT_MODELS)) {
      this.aliasToModel.set(alias as ModelAlias, model as string);
    }
  }

  getDefaultProvider(): string {
    return this.defaultProvider;
  }

  getDefaultModelAlias(): ModelAlias {
    return this.defaultModelAlias;
  }

  getModelForAlias(alias: ModelAlias): string {
    return this.aliasToModel.get(alias) ?? DEFAULT_MODELS.reasoning;
  }

  getModelForProvider(provider: string): string | undefined {
    return this.providerToModel.get(provider);
  }

  setDefaultProvider(provider: string) {
    this.defaultProvider = provider;
  }

  setDefaultModelAlias(alias: ModelAlias) {
    this.defaultModelAlias = alias;
  }
}