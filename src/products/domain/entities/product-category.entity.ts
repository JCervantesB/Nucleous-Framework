export interface ProductCategoryProps {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export class ProductCategory {
  private constructor(private readonly props: ProductCategoryProps) {}

  static create(params: {
    businessId: string;
    name: string;
    description?: string;
    parentId?: string;
  }): ProductCategory {
    return new ProductCategory({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      name: params.name,
      description: params.description ?? null,
      parentId: params.parentId ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: ProductCategoryProps): ProductCategory {
    return new ProductCategory(props);
  }

  deactivate(): ProductCategory {
    return new ProductCategory({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  activate(): ProductCategory {
    return new ProductCategory({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  update(params: {
    name?: string;
    description?: string;
    parentId?: string | null;
  }): ProductCategory {
    return new ProductCategory({
      ...this.props,
      name: params.name ?? this.props.name,
      description: params.description ?? this.props.description,
      parentId: params.parentId !== undefined ? params.parentId : this.props.parentId,
      updatedAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get businessId(): string {
    return this.props.businessId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get parentId(): string | null {
    return this.props.parentId;
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
