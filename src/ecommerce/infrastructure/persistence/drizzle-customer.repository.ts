import { Injectable, Inject } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { db } from "#app/database/client";
import { customer, customerAddress } from "#app/database/schema/ecommerce";
import { Customer, CustomerProps } from "../../domain/entities/customer.entity.js";
import { CustomerAddress, CustomerAddressProps } from "../../domain/entities/customer-address.entity.js";
import { CustomerRepository, CustomerAddressRepository } from "../../domain/repositories/customer.repository.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

function mapRowToCustomer(row: typeof customer.$inferSelect): Customer {
  const props: CustomerProps = {
    id: row.id,
    businessId: row.businessId,
    userId: row.userId,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    isGuest: row.isGuest,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  return new Customer(props);
}

function mapRowToCustomerAddress(row: typeof customerAddress.$inferSelect): CustomerAddress {
  const props: CustomerAddressProps = {
    id: row.id,
    customerId: row.customerId,
    label: row.label,
    street: row.street,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    countryCode: row.countryCode,
    isDefaultShipping: row.isDefaultShipping,
    isDefaultBilling: row.isDefaultBilling,
    createdAt: row.createdAt,
  };
  return new CustomerAddress(props);
}

@Injectable()
export class DrizzleCustomerRepository implements CustomerRepository {
  constructor(
    @Inject("DB") private readonly _db: typeof db
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const result = await this._db.select().from(customer).where(eq(customer.id, id)).limit(1);
    if (result.length === 0) return null;
    return mapRowToCustomer(result[0]);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await this._db
      .select()
      .from(customer)
      .where(eq(customer.email, email))
      .limit(1);
    if (result.length === 0) return null;
    return mapRowToCustomer(result[0]);
  }

  async findByBusinessId(
    businessId: string,
    options?: { isGuest?: boolean; limit?: number; offset?: number }
  ): Promise<{ data: Customer[]; total: number }> {
    const conditions = [eq(customer.businessId, businessId)];
    if (options?.isGuest !== undefined) {
      conditions.push(eq(customer.isGuest, options.isGuest));
    }

    const data = await this._db
      .select()
      .from(customer)
      .where(and(...conditions))
      .limit(options?.limit ?? 20)
      .offset(options?.offset ?? 0)
      .orderBy(customer.createdAt);

    return {
      data: data.map(mapRowToCustomer),
      total: data.length,
    };
  }

  async create(entity: Customer): Promise<void> {
    const props = entity.toProps();
    await this._db.insert(customer).values({
      id: props.id,
      businessId: props.businessId,
      userId: props.userId,
      email: props.email,
      firstName: props.firstName,
      lastName: props.lastName,
      phone: props.phone,
      isGuest: props.isGuest,
      isActive: props.isActive,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(entity: Customer): Promise<void> {
    const props = entity.toProps();
    await this._db
      .update(customer)
      .set({
        userId: props.userId,
        email: props.email,
        firstName: props.firstName,
        lastName: props.lastName,
        phone: props.phone,
        isActive: props.isActive,
        updatedAt: props.updatedAt,
      })
      .where(eq(customer.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this._db.delete(customer).where(eq(customer.id, id));
  }
}

@Injectable()
export class DrizzleCustomerAddressRepository implements CustomerAddressRepository {
  constructor(
    @Inject("DB") private readonly _db: typeof db
  ) {}

  async findById(id: string): Promise<CustomerAddress | null> {
    const result = await this._db
      .select()
      .from(customerAddress)
      .where(eq(customerAddress.id, id))
      .limit(1);
    if (result.length === 0) return null;
    return mapRowToCustomerAddress(result[0]);
  }

  async findByCustomerId(customerId: string): Promise<CustomerAddress[]> {
    const result = await this._db
      .select()
      .from(customerAddress)
      .where(eq(customerAddress.customerId, customerId));
    return result.map(mapRowToCustomerAddress);
  }

  async findDefaultByCustomerId(customerId: string): Promise<CustomerAddress | null> {
    const result = await this._db
      .select()
      .from(customerAddress)
      .where(
        and(
          eq(customerAddress.customerId, customerId),
          eq(customerAddress.isDefaultShipping, true)
        )
      )
      .limit(1);
    if (result.length === 0) return null;
    return mapRowToCustomerAddress(result[0]);
  }

  async create(entity: CustomerAddress): Promise<void> {
    const props = entity.toProps();
    await this._db.insert(customerAddress).values({
      id: props.id,
      customerId: props.customerId,
      label: props.label,
      street: props.street,
      city: props.city,
      state: props.state,
      postalCode: props.postalCode,
      countryCode: props.countryCode,
      isDefaultShipping: props.isDefaultShipping,
      isDefaultBilling: props.isDefaultBilling,
      createdAt: props.createdAt,
    });
  }

  async update(entity: CustomerAddress): Promise<void> {
    const props = entity.toProps();
    await this._db
      .update(customerAddress)
      .set({
        label: props.label,
        street: props.street,
        city: props.city,
        state: props.state,
        postalCode: props.postalCode,
        isDefaultShipping: props.isDefaultShipping,
        isDefaultBilling: props.isDefaultBilling,
      })
      .where(eq(customerAddress.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this._db.delete(customerAddress).where(eq(customerAddress.id, id));
  }
}
