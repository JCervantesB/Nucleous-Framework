export interface AiUsageProps {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class AiUsage {
  private constructor(private readonly props: AiUsageProps) {}

  static create(props: AiUsageProps): AiUsage {
    return new AiUsage(props);
  }

  static fromSdk(usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  }): AiUsage {
    return new AiUsage({
      promptTokens: usage.promptTokens ?? 0,
      completionTokens: usage.completionTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
    });
  }

  get promptTokens(): number {
    return this.props.promptTokens;
  }

  get completionTokens(): number {
    return this.props.completionTokens;
  }

  get totalTokens(): number {
    return this.props.totalTokens;
  }

  toJSON(): AiUsageProps {
    return { ...this.props };
  }
}