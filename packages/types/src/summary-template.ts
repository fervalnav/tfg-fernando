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
