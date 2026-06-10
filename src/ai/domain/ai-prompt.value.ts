export interface AiPromptProps {
  systemPrompt?: string;
  userPrompt: string;
}

export class AiPrompt {
  private constructor(private readonly props: AiPromptProps) {}

  static create(props: AiPromptProps): AiPrompt {
    if (!props.userPrompt || props.userPrompt.trim().length === 0) {
      throw new Error('User prompt cannot be empty');
    }
    return new AiPrompt(props);
  }

  static fromSingle(prompt: string): AiPrompt {
    return new AiPrompt({ userPrompt: prompt });
  }

  withSystemPrompt(systemPrompt: string): AiPrompt {
    return new AiPrompt({
      ...this.props,
      systemPrompt,
    });
  }

  toMessages(): Array<{ role: 'system' | 'user'; content: string }> {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    if (this.props.systemPrompt) {
      messages.push({ role: 'system', content: this.props.systemPrompt });
    }

    messages.push({ role: 'user', content: this.props.userPrompt });

    return messages;
  }

  get systemPrompt(): string | undefined {
    return this.props.systemPrompt;
  }

  get userPrompt(): string {
    return this.props.userPrompt;
  }

  get hasSystemPrompt(): boolean {
    return !!this.props.systemPrompt && this.props.systemPrompt.length > 0;
  }
}