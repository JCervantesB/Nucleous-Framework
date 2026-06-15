import { Injectable, Inject } from '@nestjs/common';
import { and, eq, ilike, sql } from 'drizzle-orm';
import { db } from '#app/database/client.js';
import { contact } from '#app/database/schema/core.js';
import {
  Contact,
  type ContactProps,
  type ContactType,
} from '../../domain/contacts/contact.entity.js';
import {
  type ContactRepository,
  type ListContactsOptions,
} from '../../domain/contacts/contact.repository.js';

@Injectable()
export class DrizzleContactRepository implements ContactRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: Contact): Promise<Contact> {
    await this._db.insert(contact).values({
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
    const rows = await this._db
      .select()
      .from(contact)
      .where(and(eq(contact.id, id), eq(contact.businessId, businessId)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async update(entity: Contact): Promise<Contact> {
    await this._db
      .update(contact)
      .set({
        name: entity.name,
        email: entity.email,
        phone: entity.phone,
        taxId: entity.taxId,
        isCustomer: entity.isCustomer,
        isSupplier: entity.isSupplier,
        isEmployee: entity.isEmployee,
        updatedAt: entity.updatedAt,
        updatedBy: entity.updatedBy,
      })
      .where(
        and(
          eq(contact.id, entity.id),
          eq(contact.businessId, entity.businessId),
        ),
      );
    return entity;
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

    const rows = await this._db
      .select()
      .from(contact)
      .where(and(...conditions))
      .orderBy(contact.name)
      .limit(pageSize)
      .offset(offset);

    const countResult = await this._db
      .select({ count: sql<number>`count(*)` })
      .from(contact)
      .where(and(...conditions));

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      total: Number(countResult[0]?.count ?? 0),
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
    return Contact.fromProps(props);
  }
}
