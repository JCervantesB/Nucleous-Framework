import { RecordEvent } from "./record-event.entity.js";

export interface RecordEventRepository {
  create(event: RecordEvent): Promise<RecordEvent>;

  listForRecord(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
  }): Promise<RecordEvent[]>;
}