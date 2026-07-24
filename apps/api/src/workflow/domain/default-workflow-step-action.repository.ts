import type { DefaultWorkflowStepAction } from './default-workflow-step-action.entity';

export abstract class DefaultWorkflowStepActionRepository {
  abstract findByWorkflowStepIds(stepIds: string[]): Promise<DefaultWorkflowStepAction[]>;
  abstract findById(id: string): Promise<DefaultWorkflowStepAction | null>;
  abstract save(action: DefaultWorkflowStepAction): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
