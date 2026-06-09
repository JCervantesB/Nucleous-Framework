import { Inject, Injectable } from '@nestjs/common';
import type { ActivityRepository } from '../activity.repository.js';
import { ACTIVITY_REPOSITORY } from '../activity.repository.js';

interface CompleteActivityInput {
  businessId: string;
  activityId: string;
  userId: string;
}

@Injectable()
export class CompleteActivityUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly repo: ActivityRepository,
  ) {}

  async execute(input: CompleteActivityInput): Promise<void> {
    const activity = await this.repo.findById(
      input.activityId,
      input.businessId,
    );
    if (!activity) {
      throw new Error('Actividad no encontrada');
    }

    activity.markDone(input.userId);
    await this.repo.save(activity);
  }
}
