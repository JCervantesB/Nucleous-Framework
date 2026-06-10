import { Injectable, Inject } from '@nestjs/common';
import { and, eq, desc, asc } from 'drizzle-orm';
import { db } from '#app/database/client.js';
import { activity } from '#app/database/schema/core.js';
import {
  Activity,
  type ActivityProps,
  type ActivityStatus,
} from '../../domain/activity/activity.entity.js';
import type { ActivityRepository } from '../../domain/activity/activity.repository.js';

@Injectable()
export class DrizzleActivityRepository implements ActivityRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: Activity): Promise<Activity> {
    await this._db.insert(activity).values({
      id: entity.id,
      businessId: entity.businessId,
      userId: entity.userId,
      relatedTable: entity.relatedTable,
      relatedId: entity.relatedId,
      type: entity.type,
      status: entity.status,
      title: entity.title,
      note: entity.note,
      dueDate: entity.dueDate,
      isPinned: entity.isPinned,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    });
    return entity;
  }

  async findById(id: string, businessId: string): Promise<Activity | null> {
    const rows = await this._db
      .select()
      .from(activity)
      .where(and(eq(activity.id, id), eq(activity.businessId, businessId)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async save(entity: Activity): Promise<void> {
    await this._db
      .update(activity)
      .set({
        status: entity.status,
        title: entity.title,
        note: entity.note,
        dueDate: entity.dueDate,
        isPinned: entity.isPinned,
        updatedAt: entity.updatedAt ?? new Date(),
        updatedBy: entity.updatedBy,
      })
      .where(eq(activity.id, entity.id));
  }

  async listForRecord(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
    status?: 'PENDING' | 'DONE' | 'CANCELLED';
  }): Promise<Activity[]> {
    const conditions = [
      eq(activity.businessId, params.businessId),
      eq(activity.relatedTable, params.relatedTable),
      eq(activity.relatedId, params.relatedId),
    ];

    if (params.status) {
      conditions.push(eq(activity.status, params.status));
    }

    const rows = await this._db
      .select()
      .from(activity)
      .where(and(...conditions))
      .orderBy(desc(activity.dueDate), desc(activity.createdAt));

    return rows.map((row) => this.mapToEntity(row));
  }

  async listForUser(params: {
    businessId: string;
    userId: string;
    status?: 'PENDING' | 'DONE' | 'CANCELLED';
  }): Promise<Activity[]> {
    const conditions = [
      eq(activity.businessId, params.businessId),
      eq(activity.userId, params.userId),
    ];

    if (params.status) {
      conditions.push(eq(activity.status, params.status));
    }

    const rows = await this._db
      .select()
      .from(activity)
      .where(and(...conditions))
      .orderBy(asc(activity.dueDate), asc(activity.createdAt));

    return rows.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: typeof activity.$inferSelect): Activity {
    const props: ActivityProps = {
      id: row.id,
      businessId: row.businessId,
      userId: row.userId,
      relatedTable: row.relatedTable,
      relatedId: row.relatedId,
      type: row.type,
      status: row.status as ActivityStatus,
      title: row.title,
      note: row.note,
      dueDate: row.dueDate,
      isPinned: row.isPinned,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      updatedAt: row.updatedAt ?? null,
      updatedBy: row.updatedBy,
    };
    return Activity.fromProps(props);
  }
}
