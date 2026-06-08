import { ActivityRepository } from '../activity.repository.js';

export class ListActivitiesForRecordUseCase {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async execute(params: {
    businessId: string;
    relatedTable: string;
    relatedId: string;
    status?: 'PENDING' | 'DONE' | 'CANCELLED';
  }) {
    const activities = await this.activityRepo.listForRecord(params);
    return { data: activities };
  }
}