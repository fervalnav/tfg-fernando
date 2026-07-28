import type { WorkflowStepAction } from './workflow-step-action.entity';

export abstract class WorkflowStepActionRepository {
  abstract findByOpportunityId(opportunityId: string, accountId: string): Promise<WorkflowStepAction[]>;
  abstract findByOpportunityAndStep(opportunityId: string, workflowStepId: string): Promise<WorkflowStepAction[]>;
  abstract findById(id: string, opportunityId: string): Promise<WorkflowStepAction | null>;
  abstract save(action: WorkflowStepAction): Promise<void>;
  abstract saveMany(actions: WorkflowStepAction[]): Promise<void>;
  abstract deleteByOpportunityId(opportunityId: string): Promise<void>;
}
