import { RecordEvent } from "../record-event.entity.js";
import { RecordEventRepository } from "../record-event.repository.js";

interface AddRecordEventInput {
  businessId: string;
  userId?: string | null;
  relatedTable: string;
  relatedId: string;
  type: string;
  message: string;
}

export class AddRecordEventUseCase {
  constructor(
    private readonly repo: RecordEventRepository,
  ) {}

  async execute(input: AddRecordEventInput): Promise<RecordEvent> {
    const event = RecordEvent.create({
      businessId: input.businessId,
      userId: input.userId ?? null,
      relatedTable: input.relatedTable,
      relatedId: input.relatedId,
      type: input.type,
      message: input.message,
    });

    return await this.repo.create(event);
  }
}