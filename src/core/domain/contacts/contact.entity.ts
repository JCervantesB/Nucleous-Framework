export type ContactType = "PERSON" | "COMPANY";

export interface ContactProps {
  id: string;
  businessId: string;
  type: ContactType;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  isEmployee: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export class Contact {
  private props: ContactProps;

  private constructor(props: ContactProps) {
    this.props = props;
  }

  static create(params: {
    businessId: string;
    type: ContactType;
    name: string;
    email?: string;
    phone?: string;
    taxId?: string;
    isCustomer?: boolean;
    isSupplier?: boolean;
    isEmployee?: boolean;
    createdBy?: string;
  }): Contact {
    const now = new Date();
    return new Contact({
      id: crypto.randomUUID(),
      businessId: params.businessId,
      type: params.type,
      name: params.name,
      email: params.email ?? null,
      phone: params.phone ?? null,
      taxId: params.taxId ?? null,
      isCustomer: params.isCustomer ?? false,
      isSupplier: params.isSupplier ?? false,
      isEmployee: params.isEmployee ?? false,
      createdAt: now,
      updatedAt: null,
      createdBy: params.createdBy ?? null,
      updatedBy: null,
    });
  }

  static fromProps(props: ContactProps): Contact {
    return new Contact(props);
  }

  get id() { return this.props.id; }
  get businessId() { return this.props.businessId; }
  get type() { return this.props.type; }
  get name() { return this.props.name; }
  get email() { return this.props.email; }
  get phone() { return this.props.phone; }
  get taxId() { return this.props.taxId; }
  get isCustomer() { return this.props.isCustomer; }
  get isSupplier() { return this.props.isSupplier; }
  get isEmployee() { return this.props.isEmployee; }
  get createdAt() { return this.props.createdAt; }
  get createdBy() { return this.props.createdBy; }
  get updatedAt() { return this.props.updatedAt; }
  get updatedBy() { return this.props.updatedBy; }
}