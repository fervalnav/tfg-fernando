import { Command } from '@nestjs/cqrs';
import type { ActionTargetType } from '@tfg/types';

export class UpdateDefaultStepActionCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly workflowId: string,
    public readonly accountId: string,
    public readonly name: string,
    public readonly targetType: ActionTargetType,
    public readonly targetId: string | null,
    public readonly metadata: Record<string, unknown> | null,
    public readonly position: number,
  ) {
    super();
  }
}
