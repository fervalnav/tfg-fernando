import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { AttachmentDownloadDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

type UploadAttachmentParams = {
  id: string;
  opportunityId: string;
  file: File;
  description?: string;
  workflowStepActionId?: string;
};

export const useUploadOpportunityAttachmentMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UploadAttachmentParams) => {
      const body = new FormData();
      body.append('id', params.id);
      body.append('file', params.file);
      if (params.description) body.append('description', params.description);
      if (params.workflowStepActionId) body.append('workflowStepActionId', params.workflowStepActionId);
      return api(`/opportunities/${params.opportunityId}/attachments`, { method: 'POST', body });
    },
    onSuccess: async (_, params) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['opportunities', 'attachments', params.opportunityId] }),
        queryClient.invalidateQueries({ queryKey: ['opportunities', 'workflow', params.opportunityId] }),
      ]);
    },
  });
};

export const useDeleteOpportunityAttachmentMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { opportunityId: string; attachmentId: string }) =>
      api(`/opportunities/${params.opportunityId}/attachments/${params.attachmentId}`, { method: 'DELETE' }),
    onSuccess: (_, params) =>
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'attachments', params.opportunityId] }),
  });
};

export const useDownloadOpportunityAttachmentMutation = () => {
  const api = useApi();
  return useMutation({
    mutationFn: (params: { opportunityId: string; attachmentId: string }) =>
      api<AttachmentDownloadDto>(
        `/opportunities/${params.opportunityId}/attachments/${params.attachmentId}/download-url`,
      ),
  });
};
