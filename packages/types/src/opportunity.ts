export type FinalOutcomeType = 'WON' | 'LOST' | 'DROPPED';

export type OpportunityDto = {
  id: string;
  accountId: string;
  title: string;
  description: string | null;
  amount: number | null;
  currency: string | null;
  pipelineId: string;
  pipelineStatusId: string;
  sortPoints: number;
  workflowId: string | null;
  workflowStepId: string | null;
  organizationId: string | null;
  dueDate: string | null;
  finalOutcomeType: FinalOutcomeType | null;
  closedAt: string | null;
  responsibleUserIds: string[];
  responsibleTeamIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOpportunityPayload = {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  pipelineId: string;
  pipelineStatusId: string;
  workflowId?: string;
  dueDate?: string;
};

export type UpdateOpportunityPayload = Partial<{
  title: string;
  description: string | null;
  amount: number | null;
  currency: string | null;
  dueDate: string | null;
  responsibleUserIds: string[];
  responsibleTeamIds: string[];
}>;

export type TransitionOpportunityStatusPayload = {
  pipelineStatusId: string;
  finalOutcomeType?: FinalOutcomeType;
  sortPoints?: number;
};

export type UpdateOpportunityPositionPayload = {
  sortPoints: number;
  pipelineStatusId?: string;
};

export type OpportunityFilters = {
  q?: string;
  statusIds?: string[];
  userId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  amountMin?: number;
  amountMax?: number;
};

export type PipelineStatusTotalsDto = {
  statusId: string;
  count: number;
  totalAmount: number;
};
