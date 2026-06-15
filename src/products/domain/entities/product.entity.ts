export type ProductType = 'storable' | 'consumable' | 'service';

export interface ProductProps {
  id: string;
  businessId: string;
  sku: string;
  name: string;
  description: string | null;
  type: ProductType;
  categoryId: string | null;
  basePrice: number;
  currencyCode: string;
  isActive: boolean;
  trackInventory: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(params: {
    businessId: string;
    sku: string;
    name: string;
    description?: string;
    type: ProductType;
    categoryId?: string;
    basePrice: number;
    currencyCode?: string;
    trackInventory?: boolean;
    createdBy?: string;
  }): Product {
    return new Product({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      sku: params.sku,
      name: params.name,
      description: params.description ?? null,
      type: params.type,
      categoryId: params.categoryId ?? null,
      basePrice: params.basePrice,
      currencyCode: params.currencyCode ?? 'USD',
      isActive: true,
      trackInventory: params.trackInventory ?? true,
      createdAt: new Date(),
      updatedAt: null,
      createdBy: params.createdBy ?? null,
      updatedBy: null,
    });
  }

  static fromProps(props: ProductProps): Product {
    return new Product(props);
  }

  deactivate(): Product {
    return new Product({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  activate(): Product {
    return new Product({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  update(params: {
    name?: string;
    description?: string;
    type?: ProductType;
    categoryId?: string;
    basePrice?: number;
    currencyCode?: string;
    trackInventory?: boolean;
    updatedBy?: string;
  }): Product {
    return new Product({
      ...this.props,
      name: params.name ?? this.props.name,
      description: params.description ?? this.props.description,
      type: params.type ?? this.props.type,
      categoryId: params.categoryId !== undefined ? params.categoryId : this.props.categoryId,
      basePrice: params.basePrice ?? this.props.basePrice,
      currencyCode: params.currencyCode ?? this.props.currencyCode,
      trackInventory: params.trackInventory ?? this.props.trackInventory,
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

  get sku(): string {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get type(): ProductType {
    return this.props.type;
  }

  get categoryId(): string | null {
    return this.props.categoryId;
  }

  get basePrice(): number {
    return this.props.basePrice;
  }

  get currencyCode(): string {
    return this.props.currencyCode;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get trackInventory(): boolean {
    return this.props.trackInventory;
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
