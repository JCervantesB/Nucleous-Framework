import { Inject, Injectable } from '@nestjs/common';
import type { ActivityRepository } from '../activity.repository.js';
import { ACTIVITY_REPOSITORY } from '../activity.repository.js';

@Injectable()
export class ListActivitiesForUserUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepo: ActivityRepository,
  ) {}

  async execute(params: {
    businessId: string;
    userId: string;
    status?: 'PENDING' | 'DONE' | 'CANCELLED';
  }) {
    const activities = await this.activityRepo.listForUser(params);
    return { data: activities };
  }
}
