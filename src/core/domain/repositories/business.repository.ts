import { Business } from "../entities/business.entity.js";

export interface BusinessRepository {
  create(business: Business): Promise<Business>;
  findById(id: string): Promise<Business | null>;
  findBySlug(slug: string): Promise<Business | null>;
}