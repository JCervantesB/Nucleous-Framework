export type ActivityStatus = 'PENDING' | 'DONE' | 'CANCELLED';

export interface ActivityProps {
  id: string;
  businessId: string;
  userId: string;
  relatedTable: string;
  relatedId: string;
  type: string;
  status: ActivityStatus;
  title: string;
  note: string | null;
  dueDate: Date | null;
  isPinned: boolean;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export class Activity {
  private props: ActivityProps;

  private constructor(props: ActivityProps) {
    this.props = props;
  }

  static create(params: {
    businessId: string;
    userId: string;
    relatedTable: string;
    relatedId: string;
    type: string;
    title: string;
    note?: string;
    dueDate?: Date;
    isPinned?: boolean;
    createdBy?: string;
  }): Activity {
    const now = new Date();
    return new Activity({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      userId: params.userId,
      relatedTable: params.relatedTable,
      relatedId: params.relatedId,
      type: params.type,
      status: 'PENDING',
      title: params.title,
      note: params.note ?? null,
      dueDate: params.dueDate ?? null,
      isPinned: params.isPinned ?? false,
      createdAt: now,
      createdBy: params.createdBy ?? null,
      updatedAt: null,
      updatedBy: null,
    });
  }

  static fromProps(props: ActivityProps): Activity {
    return new Activity(props);
  }

  markDone(userId: string): void {
    if (this.props.status === 'DONE') return;
    this.props.status = 'DONE';
    this.touch(userId);
  }

  cancel(userId: string): void {
    if (this.props.status === 'CANCELLED') return;
    this.props.status = 'CANCELLED';
    this.touch(userId);
  }

  private touch(userId: string): void {
    const now = new Date();
    this.props.updatedAt = now;
    this.props.updatedBy = userId;
  }

  get id() {
    return this.props.id;
  }
  get businessId() {
    return this.props.businessId;
  }
  get userId() {
    return this.props.userId;
  }
  get relatedTable() {
    return this.props.relatedTable;
  }
  get relatedId() {
    return this.props.relatedId;
  }
  get type() {
    return this.props.type;
  }
  get status() {
    return this.props.status;
  }
  get title() {
    return this.props.title;
  }
  get note() {
    return this.props.note;
  }
  get dueDate() {
    return this.props.dueDate;
  }
  get isPinned() {
    return this.props.isPinned;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get updatedBy() {
    return this.props.updatedBy;
  }
}
