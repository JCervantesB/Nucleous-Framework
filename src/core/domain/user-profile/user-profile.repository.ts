import { UserProfile } from "./user-profile.entity.js";

export interface UserProfileRepository {
  create(profile: UserProfile): Promise<UserProfile>;
  findById(id: string): Promise<UserProfile | null>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}