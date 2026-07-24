import { useApi } from '~/modules/shared/composables/useApi';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CreateDefaultStepActionPayload } from '@tfg/types';

export const useCreateDefaultStepActionMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workflowId,
      stepId,
      ...data
    }: CreateDefaultStepActionPayload & { workflowId: string; stepId: string }) =>
      api(`/workflows/${workflowId}/steps/${stepId}/actions`, { method: 'POST', body: data }),
    onSuccess: (_, { workflowId }) => queryClient.invalidateQueries({ queryKey: ['workflows', workflowId] }),
  });
};
