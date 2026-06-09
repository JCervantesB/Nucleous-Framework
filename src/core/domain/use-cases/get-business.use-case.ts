import { Inject, Injectable } from '@nestjs/common';
import type { BusinessRepository } from '../repositories/business.repository.js';
import { BUSINESS_REPOSITORY } from '../repositories/business.repository.js';

@Injectable()
export class GetBusinessUseCase {
  constructor(
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepo: BusinessRepository,
  ) {}

  async execute({ id }: { id: string }) {
    const business = await this.businessRepo.findById(id);
    return { business };
  }
}
