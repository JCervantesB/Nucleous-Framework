export type UnitType = 'unit' | 'weight' | 'volume' | 'length' | 'area';

export interface ProductUnitMeasureProps {
  id: string;
  businessId: string;
  name: string;
  abbreviation: string;
  type: UnitType;
  conversionFactor: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export class ProductUnitMeasure {
  private constructor(private readonly props: ProductUnitMeasureProps) {}

  static create(params: {
    businessId: string;
    name: string;
    abbreviation: string;
    type: UnitType;
    conversionFactor?: number;
    isDefault?: boolean;
  }): ProductUnitMeasure {
    return new ProductUnitMeasure({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      name: params.name,
      abbreviation: params.abbreviation,
      type: params.type,
      conversionFactor: params.conversionFactor ?? 1,
      isDefault: params.isDefault ?? false,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: ProductUnitMeasureProps): ProductUnitMeasure {
    return new ProductUnitMeasure(props);
  }

  update(params: {
    name?: string;
    abbreviation?: string;
    type?: UnitType;
    conversionFactor?: number;
    isDefault?: boolean;
  }): ProductUnitMeasure {
    return new ProductUnitMeasure({
      ...this.props,
      name: params.name ?? this.props.name,
      abbreviation: params.abbreviation ?? this.props.abbreviation,
      type: params.type ?? this.props.type,
      conversionFactor: params.conversionFactor ?? this.props.conversionFactor,
      isDefault: params.isDefault ?? this.props.isDefault,
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

  get abbreviation(): string {
    return this.props.abbreviation;
  }

  get type(): UnitType {
    return this.props.type;
  }

  get conversionFactor(): number {
    return this.props.conversionFactor;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }
}
