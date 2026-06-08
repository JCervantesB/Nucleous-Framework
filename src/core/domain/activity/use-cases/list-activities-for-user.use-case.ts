import { ActivityRepository } from '../activity.repository.js';

export class ListActivitiesForUserUseCase {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async execute(params: {
    businessId: string;
    userId: string;
    status?: 'PENDING' | 'DONE' | 'CANCELLED';
  }) {
    const activities = await this.activityRepo.listForUser(params);
    return { data: activities };
  }
}