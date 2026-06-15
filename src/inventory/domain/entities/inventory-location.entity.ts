export type LocationType =
  | 'INTERNAL'
  | 'SUPPLIER'
  | 'CUSTOMER'
  | 'TRANSIT'
  | 'ADJUSTMENT';

export interface InventoryLocationProps {
  id: string;
  businessId: string;
  code: string;
  name: string;
  type: LocationType;
  contactId: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
  } | null;
  isActive: boolean;
  isTransit: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export class InventoryLocation {
  private constructor(private readonly props: InventoryLocationProps) {}

  static create(params: {
    businessId: string;
    code: string;
    name: string;
    type: LocationType;
    contactId?: string;
    address?: InventoryLocationProps['address'];
    createdBy?: string;
  }): InventoryLocation {
    return new InventoryLocation({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      code: params.code,
      name: params.name,
      type: params.type,
      contactId: params.contactId ?? null,
      address: params.address ?? null,
      isActive: true,
      isTransit: params.type === 'TRANSIT',
      createdAt: new Date(),
      updatedAt: null,
      createdBy: params.createdBy ?? null,
      updatedBy: null,
    });
  }

  static fromProps(props: InventoryLocationProps): InventoryLocation {
    return new InventoryLocation(props);
  }

  deactivate(): InventoryLocation {
    return new InventoryLocation({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  activate(): InventoryLocation {
    return new InventoryLocation({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  update(params: {
    code?: string;
    name?: string;
    type?: LocationType;
    contactId?: string;
    address?: InventoryLocationProps['address'];
    updatedBy?: string;
  }): InventoryLocation {
    return new InventoryLocation({
      ...this.props,
      code: params.code ?? this.props.code,
      name: params.name ?? this.props.name,
      type: params.type ?? this.props.type,
      contactId:
        params.contactId !== undefined
          ? params.contactId
          : this.props.contactId,
      address:
        params.address !== undefined ? params.address : this.props.address,
      isTransit: params.type ? params.type === 'TRANSIT' : this.props.isTransit,
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

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): LocationType {
    return this.props.type;
  }

  get contactId(): string | null {
    return this.props.contactId;
  }

  get address(): InventoryLocationProps['address'] | null {
    return this.props.address;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isTransit(): boolean {
    return this.props.isTransit;
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
