import { RecordEvent } from './record-event.entity.js';

export const RECORD_EVENT_REPOSITORY = Symbol('RecordEventRepository');

export interface RecordEventRepository {
  create(event: RecordEvent): Promise<RecordEvent>;

  listForRecord(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
  }): Promise<RecordEvent[]>;
}
