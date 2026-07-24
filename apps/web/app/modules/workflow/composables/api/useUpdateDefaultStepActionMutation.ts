import { useApi } from '~/modules/shared/composables/useApi';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdateDefaultStepActionPayload } from '@tfg/types';

export const useUpdateDefaultStepActionMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workflowId,
      stepId,
      actionId,
      ...data
    }: UpdateDefaultStepActionPayload & { workflowId: string; stepId: string; actionId: string }) =>
      api(`/workflows/${workflowId}/steps/${stepId}/actions/${actionId}`, { method: 'PATCH', body: data }),
    onSuccess: (_, { workflowId }) => queryClient.invalidateQueries({ queryKey: ['workflows', workflowId] }),
  });
};
