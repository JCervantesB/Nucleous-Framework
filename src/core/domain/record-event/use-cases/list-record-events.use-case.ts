import { RecordEventRepository } from '../record-event.repository.js';

export class ListRecordEventsUseCase {
  constructor(private readonly recordEventRepo: RecordEventRepository) {}

  async execute(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
  }) {
    const events = await this.recordEventRepo.listForRecord(params);
    return { data: events };
  }
}