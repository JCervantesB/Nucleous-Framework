import { Activity } from "./activity.entity.js";

export interface ActivityRepository {
  create(activity: Activity): Promise<Activity>;
  findById(id: string, businessId: string): Promise<Activity | null>;
  save(activity: Activity): Promise<void>;

  listForRecord(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
    status?: "PENDING" | "DONE" | "CANCELLED";
  }): Promise<Activity[]>;

  listForUser(params: {
    businessId: string;
    userId: string;
    status?: "PENDING" | "DONE" | "CANCELLED";
  }): Promise<Activity[]>;
}