import { Business } from "../entities/business.entity.js";
import { BusinessRepository } from "../repositories/business.repository.js";

interface CreateBusinessInput {
  name: string;
  slug: string;
  legalName?: string;
  countryCode?: string;
  timezone?: string;
  currencyCode?: string;
  publicName?: string;
}

interface CreateBusinessOutput {
  business: Business;
}

export class CreateBusinessUseCase {
  constructor(
    private readonly businessRepo: BusinessRepository,
  ) {}

  async execute(input: CreateBusinessInput): Promise<CreateBusinessOutput> {
    const existing = await this.businessRepo.findBySlug(input.slug);
    if (existing) {
      throw new Error("Slug already in use");
    }

    const business = Business.create({
      name: input.name,
      slug: input.slug,
      legalName: input.legalName,
      countryCode: input.countryCode,
      timezone: input.timezone,
      currencyCode: input.currencyCode,
      publicName: input.publicName,
    });

    const saved = await this.businessRepo.create(business);
    return { business: saved };
  }
}