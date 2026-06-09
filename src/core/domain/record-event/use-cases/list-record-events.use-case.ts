import { Inject, Injectable } from '@nestjs/common';
import type { RecordEventRepository } from '../record-event.repository.js';
import { RECORD_EVENT_REPOSITORY } from '../record-event.repository.js';

@Injectable()
export class ListRecordEventsUseCase {
  constructor(
    @Inject(RECORD_EVENT_REPOSITORY)
    private readonly recordEventRepo: RecordEventRepository,
  ) {}

  async execute(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
  }) {
    const events = await this.recordEventRepo.listForRecord(params);
    return { data: events };
  }
}
