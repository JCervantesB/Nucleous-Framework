import { AiUsage, type AiUsageProps } from './ai-usage.value';

export interface AiResponseProps {
  text: string;
  usage: AiUsageProps;
  model: string;
  provider: string;
}

export class AiResponse {
  private constructor(private readonly props: AiResponseProps) {}

  static create(props: AiResponseProps): AiResponse {
    return new AiResponse(props);
  }

  static fromText(text: string, model: string, provider: string): AiResponse {
    return new AiResponse({
      text,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model,
      provider,
    });
  }

  withUsage(usage: AiUsage): AiResponse {
    return new AiResponse({
      ...this.props,
      usage: usage.toJSON(),
    });
  }

  get text(): string {
    return this.props.text;
  }

  get usage(): AiUsage {
    return AiUsage.create(this.props.usage);
  }

  get model(): string {
    return this.props.model;
  }

  get provider(): string {
    return this.props.provider;
  }

  toJSON(): AiResponseProps {
    return { ...this.props };
  }
}
