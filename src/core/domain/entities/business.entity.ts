export interface BusinessProps {
  id: string;
  name: string;
  legalName: string | null;
  slug: string;
  countryCode: string | null;
  timezone: string | null;
  currencyCode: string | null;
  publicName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export class Business {
  private props: BusinessProps;

  private constructor(props: BusinessProps) {
    this.props = props;
  }

  static create(params: {
    name: string;
    slug: string;
    legalName?: string;
    countryCode?: string;
    timezone?: string;
    currencyCode?: string;
    publicName?: string;
  }): Business {
    const now = new Date();
    return new Business({
      id: crypto.randomUUID(),
      name: params.name,
      legalName: params.legalName ?? null,
      slug: params.slug,
      countryCode: params.countryCode ?? null,
      timezone: params.timezone ?? null,
      currencyCode: params.currencyCode ?? null,
      publicName: params.publicName ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: null,
    });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get legalName() { return this.props.legalName; }
  get slug() { return this.props.slug; }
  get countryCode() { return this.props.countryCode; }
  get timezone() { return this.props.timezone; }
  get currencyCode() { return this.props.currencyCode; }
  get publicName() { return this.props.publicName; }
  get isActive() { return this.props.isActive; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
}