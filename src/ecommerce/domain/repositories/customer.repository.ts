import { Customer, CustomerProps } from "../entities/customer.entity.js";
import { CustomerAddress, CustomerAddressProps } from "../entities/customer-address.entity.js";

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByBusinessId(businessId: string, options?: {
    isGuest?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Customer[]; total: number }>;
  create(customer: Customer): Promise<void>;
  update(customer: Customer): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CustomerAddressRepository {
  findById(id: string): Promise<CustomerAddress | null>;
  findByCustomerId(customerId: string): Promise<CustomerAddress[]>;
  findDefaultByCustomerId(customerId: string): Promise<CustomerAddress | null>;
  create(address: CustomerAddress): Promise<void>;
  update(address: CustomerAddress): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CustomerPropsDTO {
  businessId: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isGuest?: boolean;
}

export interface CustomerAddressPropsDTO {
  customerId: string;
  label: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  countryCode: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export function buildCustomer(props: CustomerPropsDTO, id: string): Customer {
  return new Customer({
    id,
    businessId: props.businessId,
    userId: props.userId ?? null,
    email: props.email,
    firstName: props.firstName,
    lastName: props.lastName,
    phone: props.phone ?? null,
    isGuest: props.isGuest ?? false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: null,
  });
}

export function buildCustomerAddress(props: CustomerAddressPropsDTO, id: string): CustomerAddress {
  return new CustomerAddress({
    id,
    customerId: props.customerId,
    label: props.label,
    street: props.street,
    city: props.city,
    state: props.state ?? null,
    postalCode: props.postalCode ?? null,
    countryCode: props.countryCode,
    isDefaultShipping: props.isDefaultShipping ?? false,
    isDefaultBilling: props.isDefaultBilling ?? false,
    createdAt: new Date(),
  });
}
