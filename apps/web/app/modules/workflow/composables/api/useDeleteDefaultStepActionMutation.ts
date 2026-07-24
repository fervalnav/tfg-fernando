import { useApi } from '~/modules/shared/composables/useApi';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

export const useDeleteDefaultStepActionMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, stepId, actionId }: { workflowId: string; stepId: string; actionId: string }) =>
      api(`/workflows/${workflowId}/steps/${stepId}/actions/${actionId}`, { method: 'DELETE' }),
    onSuccess: (_, { workflowId }) => queryClient.invalidateQueries({ queryKey: ['workflows', workflowId] }),
  });
};
