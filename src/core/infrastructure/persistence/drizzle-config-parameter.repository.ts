import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { configParameter } from '#app/database/schema/core.js';
import {
  ConfigParameter,
  type ConfigParameterProps,
} from '../../domain/config-parameter/config-parameter.entity.js';
import type { ConfigParameterRepository } from '../../domain/config-parameter/config-parameter.repository.js';

@Injectable()
export class DrizzleConfigParameterRepository implements ConfigParameterRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async upsert(entity: ConfigParameter): Promise<ConfigParameter> {
    const existing = await this.findByKey(
      entity.key,
      entity.businessId ?? undefined,
    );
    if (existing) {
      await this._db
        .update(configParameter)
        .set({
          value: entity.value,
        })
        .where(eq(configParameter.id, existing.id));
    } else {
      await this._db.insert(configParameter).values({
        id: entity.id,
        key: entity.key,
        value: entity.value,
        businessId: entity.businessId,
        createdAt: entity.createdAt,
        createdBy: entity.createdBy,
      });
    }
    return entity;
  }

  async findByKey(
    key: string,
    businessId?: string,
  ): Promise<ConfigParameter | null> {
    let rows;
    if (businessId) {
      rows = await this._db
        .select()
        .from(configParameter)
        .where(
          and(
            eq(configParameter.key, key),
            eq(configParameter.businessId, businessId),
          ),
        )
        .limit(1);
    } else {
      rows = await this._db
        .select()
        .from(configParameter)
        .where(
          and(eq(configParameter.key, key), isNull(configParameter.businessId)),
        )
        .limit(1);
    }
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async listByBusiness(businessId: string): Promise<ConfigParameter[]> {
    const rows = await this._db
      .select()
      .from(configParameter)
      .where(eq(configParameter.businessId, businessId));
    return rows.map((row) => this.mapToEntity(row));
  }

  async listGlobal(): Promise<ConfigParameter[]> {
    const rows = await this._db
      .select()
      .from(configParameter)
      .where(isNull(configParameter.businessId));
    return rows.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(
    row: typeof configParameter.$inferSelect,
  ): ConfigParameter {
    const props: ConfigParameterProps = {
      id: row.id,
      key: row.key,
      value: row.value,
      businessId: row.businessId,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
    };
    return ConfigParameter.fromProps(props);
  }
}
