import { and, eq, ilike, sql } from "drizzle-orm";
import { db } from "../../../../db/client.js";
import { contact } from "@app/database/schema/core.js";
import { Contact, ContactProps, ContactType } from "../../domain/contacts/contact.entity.js";
import { ContactRepository, ListContactsOptions } from "../../domain/contacts/contact.repository.js";

export class DrizzleContactRepository implements ContactRepository {
  async create(entity: Contact): Promise<Contact> {
    await db.insert(contact).values({
      id: entity.id,
      businessId: entity.businessId,
      type: entity.type,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      taxId: entity.taxId,
      isCustomer: entity.isCustomer,
      isSupplier: entity.isSupplier,
      isEmployee: entity.isEmployee,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    });
    return entity;
  }

  async findById(id: string, businessId: string): Promise<Contact | null> {
    const row = await db.query.contact.findFirst({
      where: (tbl, { eq, and }) => and(eq(tbl.id, id), eq(tbl.businessId, businessId)),
    });

    if (!row) return null;
    return this.mapToEntity(row);
  }

  async listByBusiness(
    businessId: string,
    options?: ListContactsOptions,
  ): Promise<{ data: Contact[]; total: number }> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [eq(contact.businessId, businessId)];

    if (options?.isCustomer !== undefined) {
      conditions.push(eq(contact.isCustomer, options.isCustomer));
    }
    if (options?.isSupplier !== undefined) {
      conditions.push(eq(contact.isSupplier, options.isSupplier));
    }
    if (options?.isEmployee !== undefined) {
      conditions.push(eq(contact.isEmployee, options.isEmployee));
    }
    if (options?.search) {
      conditions.push(ilike(contact.name, `%${options.search}%`));
    }

    const rows = await db.query.contact.findMany({
      where: and(...conditions),
      limit: pageSize,
      offset,
      orderBy: (tbl, { asc }) => [asc(tbl.name)],
    });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contact)
      .where(and(...conditions));

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      total: Number(count),
    };
  }

  private mapToEntity(row: typeof contact.$inferSelect): Contact {
    const props: ContactProps = {
      id: row.id,
      businessId: row.businessId,
      type: row.type as ContactType,
      name: row.name,
      email: row.email,
      phone: row.phone,
      taxId: row.taxId,
      isCustomer: row.isCustomer,
      isSupplier: row.isSupplier,
      isEmployee: row.isEmployee,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
    };
    return new Contact(props);
  }
}