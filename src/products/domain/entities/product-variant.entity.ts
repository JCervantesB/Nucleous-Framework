export interface ProductVariantProps {
  id: string;
  productId: string;
  sku: string;
  name: string;
  priceModifier: number;
  attributes: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export class ProductVariant {
  private constructor(private readonly props: ProductVariantProps) {}

  static create(params: {
    productId: string;
    sku: string;
    name: string;
    priceModifier?: number;
    attributes?: Record<string, string>;
  }): ProductVariant {
    return new ProductVariant({
      id: crypto.randomUUID(),
      productId: params.productId,
      sku: params.sku,
      name: params.name,
      priceModifier: params.priceModifier ?? 0,
      attributes: params.attributes ?? {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: ProductVariantProps): ProductVariant {
    return new ProductVariant(props);
  }

  deactivate(): ProductVariant {
    return new ProductVariant({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  activate(): ProductVariant {
    return new ProductVariant({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  update(params: {
    name?: string;
    priceModifier?: number;
    attributes?: Record<string, string>;
  }): ProductVariant {
    return new ProductVariant({
      ...this.props,
      name: params.name ?? this.props.name,
      priceModifier: params.priceModifier ?? this.props.priceModifier,
      attributes: params.attributes ?? this.props.attributes,
      updatedAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get sku(): string {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get priceModifier(): number {
    return this.props.priceModifier;
  }

  get attributes(): Record<string, string> {
    return this.props.attributes;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }
}
