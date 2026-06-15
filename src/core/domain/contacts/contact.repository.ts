import { Contact } from './contact.entity.js';

export const CONTACT_REPOSITORY = Symbol('ContactRepository');

export interface ListContactsOptions {
  search?: string;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isEmployee?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ContactRepository {
  create(contact: Contact): Promise<Contact>;
  findById(id: string, businessId: string): Promise<Contact | null>;
  update(contact: Contact): Promise<Contact>;
  listByBusiness(
    businessId: string,
    options?: ListContactsOptions,
  ): Promise<{ data: Contact[]; total: number }>;
}
