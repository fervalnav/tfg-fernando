export type SummaryTemplateDto = {
  id: string;
  accountId: string;
  name: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSummaryTemplatePayload = {
  id: string;
  name: string;
  prompt: string;
};

export type UpdateSummaryTemplatePayload = {
  name?: string;
  prompt?: string;
};

export type SummaryDto = {
  id: string;
  accountId: string;
  opportunityId: string;
  summaryTemplateId: string;
  name: string;
  prompt: string;
  result: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateSummaryResultPayload = {
  result: string;
};

export type AddSummaryToOpportunityPayload = {
  id: string;
  summaryTemplateId: string;
};
