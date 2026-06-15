export type MoveType = 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT' | 'INTERNAL';
export type MoveState = 'DRAFT' | 'CONFIRMED' | 'DONE' | 'CANCELLED';

export interface InventoryMoveProps {
  id: string;
  businessId: string;
  productId: string;
  variantId: string | null;
  moveType: MoveType;
  state: MoveState;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: string;
  unitOfMeasureId: string;
  reference: string | null;
  notes: string | null;
  externalId: string | null;
  originTable: string | null;
  originId: string | null;
  confirmedAt: Date | null;
  doneAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export class InventoryMove {
  private constructor(private readonly props: InventoryMoveProps) {}

  static create(params: {
    businessId: string;
    productId: string;
    moveType: MoveType;
    quantity: string;
    unitOfMeasureId: string;
    variantId?: string;
    fromLocationId?: string;
    toLocationId?: string;
    reference?: string;
    notes?: string;
    externalId?: string;
    originTable?: string;
    originId?: string;
    createdBy?: string;
  }): InventoryMove {
    return new InventoryMove({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      productId: params.productId,
      variantId: params.variantId ?? null,
      moveType: params.moveType,
      state: 'DRAFT',
      fromLocationId: params.fromLocationId ?? null,
      toLocationId: params.toLocationId ?? null,
      quantity: params.quantity,
      unitOfMeasureId: params.unitOfMeasureId,
      reference: params.reference ?? null,
      notes: params.notes ?? null,
      externalId: params.externalId ?? null,
      originTable: params.originTable ?? null,
      originId: params.originId ?? null,
      confirmedAt: null,
      doneAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: null,
      createdBy: params.createdBy ?? null,
      updatedBy: null,
    });
  }

  static fromProps(props: InventoryMoveProps): InventoryMove {
    return new InventoryMove(props);
  }

  confirm(): InventoryMove {
    if (this.props.state !== 'DRAFT') {
      throw new Error('Solo se pueden confirmar movimientos en estado DRAFT');
    }
    return new InventoryMove({
      ...this.props,
      state: 'CONFIRMED',
      confirmedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  done(): InventoryMove {
    if (this.props.state !== 'CONFIRMED') {
      throw new Error('Solo se pueden completar movimientos en estado CONFIRMED');
    }
    return new InventoryMove({
      ...this.props,
      state: 'DONE',
      doneAt: new Date(),
      updatedAt: new Date(),
    });
  }

  cancel(): InventoryMove {
    if (this.props.state === 'DONE') {
      throw new Error('No se pueden cancelar movimientos ya completados');
    }
    return new InventoryMove({
      ...this.props,
      state: 'CANCELLED',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    });
  }

  update(params: {
    quantity?: string;
    fromLocationId?: string;
    toLocationId?: string;
    notes?: string;
    updatedBy?: string;
  }): InventoryMove {
    if (this.props.state !== 'DRAFT') {
      throw new Error('Solo se pueden editar movimientos en estado DRAFT');
    }
    return new InventoryMove({
      ...this.props,
      quantity: params.quantity ?? this.props.quantity,
      fromLocationId: params.fromLocationId !== undefined ? params.fromLocationId : this.props.fromLocationId,
      toLocationId: params.toLocationId !== undefined ? params.toLocationId : this.props.toLocationId,
      notes: params.notes !== undefined ? params.notes : this.props.notes,
      updatedAt: new Date(),
      updatedBy: params.updatedBy ?? null,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get businessId(): string {
    return this.props.businessId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get variantId(): string | null {
    return this.props.variantId;
  }

  get moveType(): MoveType {
    return this.props.moveType;
  }

  get state(): MoveState {
    return this.props.state;
  }

  get fromLocationId(): string | null {
    return this.props.fromLocationId;
  }

  get toLocationId(): string | null {
    return this.props.toLocationId;
  }

  get quantity(): string {
    return this.props.quantity;
  }

  get unitOfMeasureId(): string {
    return this.props.unitOfMeasureId;
  }

  get reference(): string | null {
    return this.props.reference;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get externalId(): string | null {
    return this.props.externalId;
  }

  get originTable(): string | null {
    return this.props.originTable;
  }

  get originId(): string | null {
    return this.props.originId;
  }

  get confirmedAt(): Date | null {
    return this.props.confirmedAt;
  }

  get doneAt(): Date | null {
    return this.props.doneAt;
  }

  get cancelledAt(): Date | null {
    return this.props.cancelledAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  get createdBy(): string | null {
    return this.props.createdBy;
  }

  get updatedBy(): string | null {
    return this.props.updatedBy;
  }
}
