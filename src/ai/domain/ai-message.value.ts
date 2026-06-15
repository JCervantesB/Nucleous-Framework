import { AiRole } from './ai-role.value';

export interface AiMessageProps {
  role: AiRole;
  content: string;
}

export class AiMessage {
  private constructor(private readonly props: AiMessageProps) {}

  static create(props: AiMessageProps): AiMessage {
    return new AiMessage(props);
  }

  static user(content: string): AiMessage {
    return new AiMessage({ role: AiRole.USER, content });
  }

  static assistant(content: string): AiMessage {
    return new AiMessage({ role: AiRole.ASSISTANT, content });
  }

  static system(content: string): AiMessage {
    return new AiMessage({ role: AiRole.SYSTEM, content });
  }

  toSdkFormat(): { role: 'user' | 'assistant' | 'system'; content: string } {
    return {
      role: this.props.role,
      content: this.props.content,
    };
  }

  get role(): AiRole {
    return this.props.role;
  }

  get content(): string {
    return this.props.content;
  }
}
