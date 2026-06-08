import { Contact, ContactType } from "../contact.entity.js";
import { ContactRepository } from "../contact.repository.js";

interface CreateContactInput {
  businessId: string;
  userId: string;
  type: ContactType;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isEmployee?: boolean;
}

interface CreateContactOutput {
  contact: Contact;
}

export class CreateContactUseCase {
  constructor(
    private readonly contactRepo: ContactRepository,
  ) {}

  async execute(input: CreateContactInput): Promise<CreateContactOutput> {
    const contact = Contact.create({
      businessId: input.businessId,
      type: input.type,
      name: input.name,
      email: input.email,
      phone: input.phone,
      taxId: input.taxId,
      isCustomer: input.isCustomer,
      isSupplier: input.isSupplier,
      isEmployee: input.isEmployee,
      createdBy: input.userId,
    });

    const saved = await this.contactRepo.create(contact);
    return { contact: saved };
  }
}