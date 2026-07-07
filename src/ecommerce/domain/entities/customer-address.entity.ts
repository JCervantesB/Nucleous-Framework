export interface CustomerAddressProps {
  id: string;
  customerId: string;
  label: string;
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  countryCode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: Date;
}

export class CustomerAddress {
  readonly id: string;
  readonly customerId: string;
  label: string;
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  readonly countryCode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  readonly createdAt: Date;

  constructor(props: CustomerAddressProps) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.label = props.label;
    this.street = props.street;
    this.city = props.city;
    this.state = props.state;
    this.postalCode = props.postalCode;
    this.countryCode = props.countryCode;
    this.isDefaultShipping = props.isDefaultShipping;
    this.isDefaultBilling = props.isDefaultBilling;
    this.createdAt = props.createdAt;
  }

  setAsDefaultShipping(): void {
    this.isDefaultShipping = true;
  }

  setAsDefaultBilling(): void {
    this.isDefaultBilling = true;
  }

  toProps(): CustomerAddressProps {
    return {
      id: this.id,
      customerId: this.customerId,
      label: this.label,
      street: this.street,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      countryCode: this.countryCode,
      isDefaultShipping: this.isDefaultShipping,
      isDefaultBilling: this.isDefaultBilling,
      createdAt: this.createdAt,
    };
  }
}
