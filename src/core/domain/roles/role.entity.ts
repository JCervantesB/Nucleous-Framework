export interface RoleProps {
  id: string;
  businessId: string | null;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
}

export class Role {
  private props: RoleProps;

  private constructor(props: RoleProps) {
    this.props = props;
  }

  static create(params: {
    name: string;
    slug: string;
    description?: string;
    businessId?: string;
  }): Role {
    const now = new Date();
    return new Role({
      id: crypto.randomUUID(),
      businessId: params.businessId ?? null,
      name: params.name,
      slug: params.slug,
      description: params.description ?? null,
      createdAt: now,
    });
  }

  static fromProps(props: RoleProps): Role {
    return new Role(props);
  }

  get id() {
    return this.props.id;
  }
  get businessId() {
    return this.props.businessId;
  }
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get description() {
    return this.props.description;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}
