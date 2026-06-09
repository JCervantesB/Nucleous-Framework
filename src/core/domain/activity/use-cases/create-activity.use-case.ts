import { Inject, Injectable } from '@nestjs/common';
import { Activity } from '../activity.entity.js';
import type { ActivityRepository } from '../activity.repository.js';
import { ACTIVITY_REPOSITORY } from '../activity.repository.js';

interface CreateActivityInput {
  businessId: string;
  creatorUserId: string;
  assignedUserId: string;
  relatedTable: string;
  relatedId: string;
  type: string;
  title: string;
  note?: string;
  dueDate?: Date;
  isPinned?: boolean;
}

@Injectable()
export class CreateActivityUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly repo: ActivityRepository,
  ) {}

  async execute(input: CreateActivityInput): Promise<Activity> {
    const activity = Activity.create({
      businessId: input.businessId,
      userId: input.assignedUserId,
      relatedTable: input.relatedTable,
      relatedId: input.relatedId,
      type: input.type,
      title: input.title,
      note: input.note,
      dueDate: input.dueDate,
      isPinned: input.isPinned,
      createdBy: input.creatorUserId,
    });

    return await this.repo.create(activity);
  }
}
