import { ActivityRepository } from "../activity.repository.js";

interface CompleteActivityInput {
  businessId: string;
  activityId: string;
  userId: string;
}

export class CompleteActivityUseCase {
  constructor(
    private readonly repo: ActivityRepository,
  ) {}

  async execute(input: CompleteActivityInput): Promise<void> {
    const activity = await this.repo.findById(input.activityId, input.businessId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    activity.markDone(input.userId);
    await this.repo.save(activity);
  }
}