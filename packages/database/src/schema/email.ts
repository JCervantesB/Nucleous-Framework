import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { business } from './core.js';

export const emailLog = pgTable('email_log', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => business.id),
  to: text('to').notNull(),
  cc: text('cc'),
  bcc: text('bcc'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  bodyHtml: text('body_html'),
  status: text('status').notNull().default('PENDING'),
  provider: text('provider').notNull().default('smtp'),
  providerMessageId: text('provider_message_id'),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }),
  createdBy: uuid('created_by'),
});