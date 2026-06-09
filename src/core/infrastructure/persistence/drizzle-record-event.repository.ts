import { Injectable, Inject } from '@nestjs/common';
import { and, eq, asc } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { recordEvent } from '#app/database/schema/core.js';
import {
  RecordEvent,
  type RecordEventProps,
} from '../../domain/record-event/record-event.entity.js';
import type { RecordEventRepository } from '../../domain/record-event/record-event.repository.js';

@Injectable()
export class DrizzleRecordEventRepository implements RecordEventRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: RecordEvent): Promise<RecordEvent> {
    await this._db.insert(recordEvent).values({
      id: entity.id,
      businessId: entity.businessId,
      userId: entity.userId,
      relatedTable: entity.relatedTable,
      relatedId: entity.relatedId,
      type: entity.type,
      message: entity.message,
      createdAt: entity.createdAt,
    });
    return entity;
  }

  async listForRecord(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
  }): Promise<RecordEvent[]> {
    const rows = await this._db
      .select()
      .from(recordEvent)
      .where(
        and(
          eq(recordEvent.businessId, params.businessId),
          eq(recordEvent.relatedTable, params.relatedTable),
          eq(recordEvent.relatedId, params.relatedId),
        ),
      )
      .orderBy(asc(recordEvent.createdAt));

    return rows.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: typeof recordEvent.$inferSelect): RecordEvent {
    const props: RecordEventProps = {
      id: row.id,
      businessId: row.businessId,
      userId: row.userId,
      relatedTable: row.relatedTable,
      relatedId: row.relatedId,
      type: row.type,
      message: row.message,
      createdAt: row.createdAt,
    };
    return RecordEvent.fromProps(props);
  }
}
