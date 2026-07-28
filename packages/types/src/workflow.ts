export type ActionTargetType =
  | 'control_question'
  | 'custom_field'
  | 'summary'
  | 'task'
  | 'attachment'
  | 'email_notification'
  | 'opportunity_status_update';

export type StepType = 'step' | 'decision';

export type WorkflowStepActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED';

export type WorkflowDecisionStatus = 'PENDING' | 'TRUE' | 'FALSE' | 'ERROR';

export type OpportunityWorkflowStatus = 'ACTIVE' | 'COMPLETED';

export type DefaultWorkflowStepActionDto = {
  id: string;
  workflowStepId: string;
  name: string;
  targetType: ActionTargetType;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  position: number;
};

export type WorkflowStepDto = {
  id: string;
  workflowId: string;
  name: string;
  type: StepType;
  condition: string | null;
  position: number;
  actions: DefaultWorkflowStepActionDto[];
};

export type WorkflowDto = {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  stepsCount: number;
  createdAt: string;
};

export type WorkflowDetailDto = WorkflowDto & {
  steps: WorkflowStepDto[];
};

export type WorkflowStepActionDto = {
  id: string;
  opportunityId: string;
  workflowStepId: string;
  defaultWorkflowStepActionId: string;
  name: string;
  targetType: ActionTargetType;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  position: number;
  status: WorkflowStepActionStatus;
  errorMessage: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowDecisionResultDto = {
  id: string;
  opportunityId: string;
  workflowStepId: string;
  status: WorkflowDecisionStatus;
  evidence: string | null;
  evaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OpportunityWorkflowDto = {
  workflow: WorkflowDetailDto;
  currentStepId: string;
  status: OpportunityWorkflowStatus;
  actions: WorkflowStepActionDto[];
  decisions: WorkflowDecisionResultDto[];
};

export type AssignOpportunityWorkflowPayload = {
  workflowId: string;
};

export type CreateWorkflowPayload = {
  id: string;
  name: string;
  description?: string;
};

export type UpdateWorkflowPayload = {
  name: string;
  description?: string;
};

export type WorkflowStepPayload = {
  id: string;
  name: string;
  type: StepType;
  condition?: string;
  position: number;
};

export type CreateDefaultStepActionPayload = {
  id: string;
  name: string;
  targetType: ActionTargetType;
  targetId?: string;
  metadata?: Record<string, unknown>;
  position: number;
};

export type UpdateDefaultStepActionPayload = {
  name: string;
  targetType: ActionTargetType;
  targetId?: string;
  metadata?: Record<string, unknown>;
  position: number;
};
