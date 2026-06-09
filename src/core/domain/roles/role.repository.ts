import { Role } from './role.entity.js';

export interface RoleRepository {
  create(role: Role): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findBySlug(slug: string, businessId?: string): Promise<Role | null>;
  listByBusiness(businessId: string): Promise<Role[]>;
}
