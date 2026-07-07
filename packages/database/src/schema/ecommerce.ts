import { pgTable, uuid, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const customer = pgTable("ecommerce_customer", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  userId: uuid("user_id"),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  isGuest: boolean("is_guest").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const customerAddress = pgTable("ecommerce_customer_address", {
  id: uuid("id").primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customer.id)
    .notNull(),
  label: text("label").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postal_code"),
  countryCode: text("country_code").notNull(),
  isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
  isDefaultBilling: boolean("is_default_billing").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
});

export const cart = pgTable("ecommerce_cart", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  customerId: uuid("customer_id").references(() => customer.id),
  sessionId: text("session_id"),
  currencyCode: text("currency_code").notNull().default("MXN"),
  subtotal: integer("subtotal").notNull().default(0),
  discountAmount: integer("discount_amount").notNull().default(0),
  total: integer("total").notNull().default(0),
  couponId: uuid("coupon_id"),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const cartLine = pgTable("ecommerce_cart_line", {
  id: uuid("id").primaryKey(),
  cartId: uuid("cart_id")
    .references(() => cart.id)
    .notNull(),
  productId: uuid("product_id").notNull(),
  variantId: uuid("variant_id"),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const order = pgTable("ecommerce_order", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  customerId: uuid("customer_id")
    .references(() => customer.id)
    .notNull(),
  status: text("status").notNull().default("DRAFT"),
  paymentStatus: text("payment_status").notNull().default("PENDING"),
  subtotal: integer("subtotal").notNull().default(0),
  taxAmount: integer("tax_amount").notNull().default(0),
  shippingCost: integer("shipping_cost").notNull().default(0),
  discountAmount: integer("discount_amount").notNull().default(0),
  total: integer("total").notNull().default(0),
  currencyCode: text("currency_code").notNull().default("MXN"),
  notes: text("notes"),
  shippingAddressId: uuid("shipping_address_id"),
  billingAddressId: uuid("billing_address_id"),
  couponId: uuid("coupon_id"),
  paymentIntentId: text("payment_intent_id"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { mode: "date", withTimezone: true }),
  shippedAt: timestamp("shipped_at", { mode: "date", withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { mode: "date", withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { mode: "date", withTimezone: true }),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const orderLine = pgTable("ecommerce_order_line", {
  id: uuid("id").primaryKey(),
  orderId: uuid("order_id")
    .references(() => order.id)
    .notNull(),
  productId: uuid("product_id").notNull(),
  variantId: uuid("variant_id"),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  taxRate: integer("tax_rate").notNull().default(0),
  taxAmount: integer("tax_amount").notNull().default(0),
  discountAmount: integer("discount_amount").notNull().default(0),
  subtotal: integer("subtotal").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
});

export const shipment = pgTable("ecommerce_shipment", {
  id: uuid("id").primaryKey(),
  orderId: uuid("order_id")
    .references(() => order.id)
    .notNull(),
  orderLineIds: jsonb("order_line_ids").$type<string[]>().default([]),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  status: text("status").notNull().default("PENDING"),
  shippingMethodId: uuid("shipping_method_id"),
  estimatedDelivery: timestamp("estimated_delivery", { mode: "date", withTimezone: true }),
  actualDelivery: timestamp("actual_delivery", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});
