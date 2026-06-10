import { eq } from 'drizzle-orm';
import { db } from '#app/database/client.js';
import { userProfile } from '#app/database/schema/core.js';
import {
  UserProfile,
  type UserProfileProps,
  type UserType,
} from '../../domain/user-profile/user-profile.entity.js';
import { type UserProfileRepository } from '../../domain/user-profile/user-profile.repository.js';

export class DrizzleUserProfileRepository implements UserProfileRepository {
  async create(entity: UserProfile): Promise<UserProfile> {
    await db.insert(userProfile).values({
      id: entity.id,
      userId: entity.userId,
      primaryBusinessId: entity.primaryBusinessId,
      contactId: entity.contactId,
      displayName: entity.displayName,
      avatarUrl: entity.avatarUrl,
      locale: entity.locale,
      userType: entity.userType,
      createdAt: entity.createdAt,
    });
    return entity;
  }

  async findById(id: string): Promise<UserProfile | null> {
    const rows = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const rows = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async save(entity: UserProfile): Promise<void> {
    await db
      .update(userProfile)
      .set({
        displayName: entity.displayName,
        avatarUrl: entity.avatarUrl,
        locale: entity.locale,
        userType: entity.userType,
        updatedAt: entity.updatedAt ?? new Date(),
      })
      .where(eq(userProfile.id, entity.id));
  }

  private mapToEntity(row: typeof userProfile.$inferSelect): UserProfile {
    const props: UserProfileProps = {
      id: row.id,
      userId: row.userId,
      primaryBusinessId: row.primaryBusinessId,
      contactId: row.contactId,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      locale: row.locale ?? 'es-MX',
      userType: row.userType as UserType,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
    };
    return UserProfile.fromProps(props);
  }
}
