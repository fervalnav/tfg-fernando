import { useApi } from '~/modules/shared/composables/useApi';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { WorkflowStepPayload } from '@tfg/types';

export const useUpdateWorkflowStepsMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, steps }: { workflowId: string; steps: WorkflowStepPayload[] }) =>
      api(`/workflows/${workflowId}/steps`, { method: 'PATCH', body: { steps } }),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['workflows', workflowId] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};
