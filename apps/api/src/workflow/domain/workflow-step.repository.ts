import type { WorkflowStep } from './workflow-step.entity';

export abstract class WorkflowStepRepository {
  abstract findByWorkflowId(workflowId: string): Promise<WorkflowStep[]>;
  abstract findById(id: string): Promise<WorkflowStep | null>;
  abstract saveMany(steps: WorkflowStep[]): Promise<void>;
  abstract deleteMany(ids: string[]): Promise<void>;
}
