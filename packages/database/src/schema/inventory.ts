import { pgTable, uuid, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { business } from "./core.js";
import { contact } from "./core.js";
import { product } from "./product.js";
import { productVariant } from "./product.js";
import { productUnitMeasure } from "./product.js";
import { authUser } from "./auth.js";

export const inventoryLocation = pgTable("inventory_location", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'INTERNAL' | 'SUPPLIER' | 'CUSTOMER' | 'TRANSIT' | 'ADJUSTMENT'
  contactId: uuid("contact_id").references(() => contact.id),
  address: jsonb("address").$type<{
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
  }>(),
  isActive: boolean("is_active").notNull().default(true),
  isTransit: boolean("is_transit").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  createdBy: uuid("created_by").references(() => authUser.id),
  updatedBy: uuid("updated_by").references(() => authUser.id),
});

export const inventoryMove = pgTable("inventory_move", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => product.id)
    .notNull(),
  variantId: uuid("variant_id").references(() => productVariant.id),
  moveType: text("move_type").notNull(), // 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT' | 'INTERNAL'
  state: text("state").notNull().default("DRAFT"), // 'DRAFT' | 'CONFIRMED' | 'DONE' | 'CANCELLED'
  fromLocationId: uuid("from_location_id").references(() => inventoryLocation.id),
  toLocationId: uuid("to_location_id").references(() => inventoryLocation.id),
  quantity: text("quantity").notNull(), // stored as string to avoid decimal precision issues
  unitOfMeasureId: uuid("unit_of_measure_id")
    .references(() => productUnitMeasure.id)
    .notNull(),
  reference: text("reference"), // external reference (PO, SO, etc.)
  notes: text("notes"),
  externalId: text("external_id"), // Odoo compatible external identifier
  originTable: text("origin_table"), // source table (purchase_order, sale_order, etc.)
  originId: uuid("origin_id"),
  confirmedAt: timestamp("confirmed_at", { mode: "date", withTimezone: true }),
  doneAt: timestamp("done_at", { mode: "date", withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  createdBy: uuid("created_by").references(() => authUser.id),
  updatedBy: uuid("updated_by").references(() => authUser.id),
});
