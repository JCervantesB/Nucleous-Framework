import { pgTable, uuid, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { authUser } from "./auth.js";

export const business = pgTable("business", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  slug: text("slug").notNull(),
  countryCode: text("country_code"),
  timezone: text("timezone"),
  currencyCode: text("currency_code"),
  publicName: text("public_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const businessMember = pgTable("business_member", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => authUser.id)
    .notNull(),
  role: text("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
});

export const contact = pgTable("contact", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  taxId: text("tax_id"),
  isCustomer: boolean("is_customer").notNull().default(false),
  isSupplier: boolean("is_supplier").notNull().default(false),
  isEmployee: boolean("is_employee").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  createdBy: uuid("created_by").references(() => authUser.id),
  updatedBy: uuid("updated_by").references(() => authUser.id),
});

export const contactAddress = pgTable("contact_address", {
  id: uuid("id").primaryKey(),
  contactId: uuid("contact_id")
    .references(() => contact.id)
    .notNull(),
  label: text("label").notNull(),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  countryCode: text("country_code"),
  isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
  isDefaultBilling: boolean("is_default_billing").notNull().default(false),
});

export const userProfile = pgTable("user_profile", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => authUser.id)
    .notNull(),
  primaryBusinessId: uuid("primary_business_id").references(() => business.id),
  contactId: uuid("contact_id").references(() => contact.id),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  locale: text("locale").default("es-MX"),
  userType: text("user_type").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const role = pgTable("role", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").references(() => business.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
});

export const userRole = pgTable("user_role", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => authUser.id)
    .notNull(),
  roleId: uuid("role_id")
    .references(() => role.id)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
});

export const configParameter = pgTable("config_parameter", {
  id: uuid("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  businessId: uuid("business_id").references(() => business.id),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  createdBy: uuid("created_by").references(() => authUser.id),
});

export const currency = pgTable("currency", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol"),
  decimalPlaces: integer("decimal_places").notNull().default(2),
  isActive: boolean("is_active").notNull().default(true),
});

export const country = pgTable("country", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
});

export const state = pgTable("state", {
  code: text("code").primaryKey(),
  countryCode: text("country_code")
    .references(() => country.code)
    .notNull(),
  name: text("name").notNull(),
});

export const activity = pgTable("activity", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => authUser.id)
    .notNull(),
  relatedTable: text("related_table").notNull(),
  relatedId: uuid("related_id").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("PENDING"),
  title: text("title").notNull(),
  note: text("note"),
  dueDate: timestamp("due_date", { mode: "date", withTimezone: true }),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  createdBy: uuid("created_by").references(() => authUser.id),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  updatedBy: uuid("updated_by").references(() => authUser.id),
});

export const recordEvent = pgTable("record_event", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id")
    .references(() => business.id)
    .notNull(),
  userId: uuid("user_id").references(() => authUser.id),
  relatedTable: text("related_table").notNull(),
  relatedId: uuid("related_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
});