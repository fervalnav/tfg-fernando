import { Command } from '@nestjs/cqrs';
import type { StepType } from '@tfg/types';

export type StepInput = {
  id: string;
  name: string;
  type: StepType;
  condition: string | null;
  position: number;
};

export class UpdateWorkflowStepsCommand extends Command<void> {
  constructor(
    public readonly workflowId: string,
    public readonly accountId: string,
    public readonly steps: StepInput[],
  ) {
    super();
  }
}
