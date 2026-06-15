import { pgTable, uuid, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { business } from "./core.js";
import { authUser } from "./auth.js";

export const product = pgTable("product", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'storable' | 'consumable' | 'service'
  categoryId: uuid("category_id"),
  basePrice: text("base_price").notNull(), // stored as string to avoid decimal precision issues
  currencyCode: text("currency_code").notNull().default("USD"),
  isActive: boolean("is_active").notNull().default(true),
  trackInventory: boolean("track_inventory").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  createdBy: uuid("created_by").references(() => authUser.id),
  updatedBy: uuid("updated_by").references(() => authUser.id),
});

export const productVariant = pgTable("product_variant", {
  id: uuid("id").primaryKey(),
  productId: uuid("product_id")
    .references(() => product.id)
    .notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  priceModifier: text("price_modifier").notNull().default("0"),
  attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const productCategory = pgTable("product_category", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: uuid("parent_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const productUnitMeasure = pgTable("product_unit_measure", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  type: text("type").notNull(), // 'unit' | 'weight' | 'volume' | 'length' | 'area'
  conversionFactor: text("conversion_factor").notNull().default("1"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});
