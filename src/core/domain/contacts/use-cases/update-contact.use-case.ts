import { Inject, Injectable, Logger } from '@nestjs/common';
import { Contact, type ContactType } from '../contact.entity.js';
import type { ContactRepository } from '../contact.repository.js';
import { CONTACT_REPOSITORY } from '../contact.repository.js';

interface UpdateContactInput {
  id: string;
  businessId: string;
  userId?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isEmployee?: boolean;
}

interface UpdateContactOutput {
  success: boolean;
  contact?: Contact;
}

@Injectable()
export class UpdateContactUseCase {
  private readonly logger = new Logger(UpdateContactUseCase.name);

  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepo: ContactRepository,
  ) {}

  async execute(input: UpdateContactInput): Promise<UpdateContactOutput> {
    const existing = await this.contactRepo.findById(input.id, input.businessId);
    if (!existing) {
      throw new Error('Contacto no encontrado');
    }

    const updated = existing.update({
      name: input.name,
      email: input.email,
      phone: input.phone,
      taxId: input.taxId,
      isCustomer: input.isCustomer,
      isSupplier: input.isSupplier,
      isEmployee: input.isEmployee,
      updatedBy: input.userId,
    });

    await this.contactRepo.update(updated);
    this.logger.log(`Contacto actualizado: ${input.id}`);

    return { success: true, contact: updated };
  }
}
