export interface ConfigParameterProps {
  id: string;
  key: string;
  value: string;
  businessId: string | null;
  createdAt: Date;
  createdBy: string | null;
}

export class ConfigParameter {
  private props: ConfigParameterProps;

  private constructor(props: ConfigParameterProps) {
    this.props = props;
  }

  static create(params: {
    key: string;
    value: string;
    businessId?: string;
    createdBy?: string;
  }): ConfigParameter {
    const now = new Date();
    return new ConfigParameter({
      id: crypto.randomUUID(),
      key: params.key,
      value: params.value,
      businessId: params.businessId ?? null,
      createdAt: now,
      createdBy: params.createdBy ?? null,
    });
  }

  static fromProps(props: ConfigParameterProps): ConfigParameter {
    return new ConfigParameter(props);
  }

  getValue<T>(): T {
    try {
      return JSON.parse(this.props.value) as T;
    } catch {
      return this.props.value as unknown as T;
    }
  }

  get id() {
    return this.props.id;
  }
  get key() {
    return this.props.key;
  }
  get value() {
    return this.props.value;
  }
  get businessId() {
    return this.props.businessId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get createdBy() {
    return this.props.createdBy;
  }
}
