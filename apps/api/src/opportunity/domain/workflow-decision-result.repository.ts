import type { WorkflowDecisionResult } from './workflow-decision-result.entity';

export abstract class WorkflowDecisionResultRepository {
  abstract findByOpportunityId(opportunityId: string, accountId: string): Promise<WorkflowDecisionResult[]>;
  abstract findByOpportunityAndStep(
    opportunityId: string,
    workflowStepId: string,
  ): Promise<WorkflowDecisionResult | null>;
  abstract save(result: WorkflowDecisionResult): Promise<void>;
  abstract deleteByOpportunityId(opportunityId: string): Promise<void>;
}
