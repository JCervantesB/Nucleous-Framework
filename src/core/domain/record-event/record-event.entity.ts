export interface RecordEventProps {
  id: string;
  businessId: string;
  userId: string | null;
  relatedTable: string;
  relatedId: string;
  type: string;
  message: string;
  createdAt: Date;
}

export class RecordEvent {
  private props: RecordEventProps;

  private constructor(props: RecordEventProps) {
    this.props = props;
  }

  static create(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
    type: string;
    message: string;
    userId?: string | null;
  }): RecordEvent {
    const now = new Date();
    return new RecordEvent({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      userId: params.userId ?? null,
      relatedTable: params.relatedTable,
      relatedId: params.relatedId,
      type: params.type,
      message: params.message,
      createdAt: now,
    });
  }

  static fromProps(props: RecordEventProps): RecordEvent {
    return new RecordEvent(props);
  }

  get id() { return this.props.id; }
  get businessId() { return this.props.businessId; }
  get userId() { return this.props.userId; }
  get relatedTable() { return this.props.relatedTable; }
  get relatedId() { return this.props.relatedId; }
  get type() { return this.props.type; }
  get message() { return this.props.message; }
  get createdAt() { return this.props.createdAt; }
}