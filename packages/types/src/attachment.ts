export type AttachmentDto = {
  id: string;
  accountId: string;
  opportunityId: string;
  workflowStepActionId: string | null;
  name: string;
  description: string | null;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAttachmentPayload = {
  id: string;
  description?: string;
  workflowStepActionId?: string;
};

export type AttachmentDownloadDto = {
  url: string;
};
