import { Contact } from "../contact.entity.js";
import { ContactRepository, ListContactsOptions } from "../contact.repository.js";

interface ListContactsInput {
  businessId: string;
  search?: string;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isEmployee?: boolean;
  page?: number;
  pageSize?: number;
}

interface ListContactsOutput {
  data: Contact[];
  total: number;
}

export class ListContactsUseCase {
  constructor(
    private readonly contactRepo: ContactRepository,
  ) {}

  async execute(input: ListContactsInput): Promise<ListContactsOutput> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    const options: ListContactsOptions = {
      search: input.search,
      isCustomer: input.isCustomer,
      isSupplier: input.isSupplier,
      isEmployee: input.isEmployee,
      page,
      pageSize,
    };

    return await this.contactRepo.listByBusiness(input.businessId, options);
  }
}