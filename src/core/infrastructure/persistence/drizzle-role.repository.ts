import { eq, and, isNull } from 'drizzle-orm';
import { db } from '#app/database/client.js';
import { role } from '#app/database/schema/core.js';
import { Role, type RoleProps } from '../../domain/roles/role.entity.js';
import { type RoleRepository } from '../../domain/roles/role.repository.js';

export class DrizzleRoleRepository implements RoleRepository {
  async create(entity: Role): Promise<Role> {
    await db.insert(role).values({
      id: entity.id,
      businessId: entity.businessId,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      createdAt: entity.createdAt,
    });
    return entity;
  }

  async findById(id: string): Promise<Role | null> {
    const rows = await db.select().from(role).where(eq(role.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findBySlug(slug: string, businessId?: string): Promise<Role | null> {
    let rows;
    if (businessId) {
      rows = await db
        .select()
        .from(role)
        .where(and(eq(role.slug, slug), eq(role.businessId, businessId)))
        .limit(1);
    } else {
      rows = await db
        .select()
        .from(role)
        .where(and(eq(role.slug, slug), isNull(role.businessId)))
        .limit(1);
    }
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async listByBusiness(businessId: string): Promise<Role[]> {
    const rows = await db
      .select()
      .from(role)
      .where(eq(role.businessId, businessId));
    return rows.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: typeof role.$inferSelect): Role {
    const props: RoleProps = {
      id: row.id,
      businessId: row.businessId,
      name: row.name,
      slug: row.slug,
      description: row.description,
      createdAt: row.createdAt,
    };
    return Role.fromProps(props);
  }
}
