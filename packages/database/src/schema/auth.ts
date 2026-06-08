import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const authUser = pgTable("auth_user", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const authSession = pgTable("auth_session", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => authUser.id)
    .notNull(),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
});

export const authAccount = pgTable("auth_account", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => authUser.id)
    .notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
});