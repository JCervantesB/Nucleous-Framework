import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, desc, gte, lte, like, sql } from 'drizzle-orm';
import { db } from '#app/database/client';
import { emailLog } from '#app/database/schema/email';
import { EmailLog, EmailStatus, type EmailLogProps } from '../../domain/entities/email-log.entity';
import { EMAIL_LOG_REPOSITORY, type EmailLogRepository, type ListEmailLogsOptions, type PaginatedResult } from '../../domain/repositories/email-log.repository';

@Injectable()
export class DrizzleEmailLogRepository implements EmailLogRepository {
  private readonly logger = new Logger(DrizzleEmailLogRepository.name);

  async save(entity: EmailLog): Promise<EmailLog> {
    await db.insert(emailLog).values({
      id: entity.id,
      businessId: entity.businessId,
      to: entity.to,
      cc: entity.cc,
      bcc: entity.bcc,
      subject: entity.subject,
      body: entity.body,
      bodyHtml: entity.bodyHtml,
      status: entity.status,
      provider: entity.provider,
      providerMessageId: entity.providerMessageId,
      errorMessage: entity.errorMessage,
      sentAt: entity.sentAt,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    });
    return entity;
  }

  async update(entity: EmailLog): Promise<EmailLog> {
    await db.update(emailLog).set({
      status: entity.status,
      providerMessageId: entity.providerMessageId,
      errorMessage: entity.errorMessage,
      sentAt: entity.sentAt,
      updatedAt: new Date(),
    }).where(eq(emailLog.id, entity.id));
    return entity;
  }

  async findById(id: string): Promise<EmailLog | null> {
    const rows = await db.select().from(emailLog).where(eq(emailLog.id, id)).limit(1);
    return rows[0] ? this.mapToEntity(rows[0]) : null;
  }

  async findByBusinessId(businessId: string, options?: ListEmailLogsOptions): Promise<PaginatedResult<EmailLog>> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [eq(emailLog.businessId, businessId)];

    if (options?.status) {
      conditions.push(eq(emailLog.status, options.status as EmailStatus));
    }

    if (options?.to) {
      conditions.push(like(emailLog.to, `%${options.to}%`));
    }

    if (options?.fromDate) {
      conditions.push(gte(emailLog.createdAt, options.fromDate));
    }

    if (options?.toDate) {
      conditions.push(lte(emailLog.createdAt, options.toDate));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const [rows, countResult] = await Promise.all([
      db.select().from(emailLog).where(whereClause).orderBy(desc(emailLog.createdAt)).limit(pageSize).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(emailLog).where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      data: rows.map(row => this.mapToEntity(row)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private mapToEntity(row: typeof emailLog.$inferSelect): EmailLog {
    const props: EmailLogProps = {
      id: row.id,
      businessId: row.businessId,
      to: row.to,
      cc: row.cc,
      bcc: row.bcc,
      subject: row.subject,
      body: row.body,
      bodyHtml: row.bodyHtml ?? null,
      status: row.status as EmailStatus,
      provider: row.provider,
      providerMessageId: row.providerMessageId ?? null,
      errorMessage: row.errorMessage ?? null,
      sentAt: row.sentAt ?? null,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
    };
    return EmailLog.fromProps(props);
  }
}