import { useApi } from '~/modules/shared/composables/useApi';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

export const useDuplicateWorkflowMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<{ id: string }>(`/workflows/${id}/duplicate`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });
};
