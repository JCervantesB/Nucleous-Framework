import { BusinessRepository } from '../repositories/business.repository.js';

export class GetBusinessUseCase {
  constructor(private readonly businessRepo: BusinessRepository) {}

  async execute({ id }: { id: string }) {
    const business = await this.businessRepo.findById(id);
    return { business };
  }
}