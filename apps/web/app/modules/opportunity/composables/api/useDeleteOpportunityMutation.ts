import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '~/modules/shared/composables/useApi';

export const useDeleteOpportunityMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api(`/opportunities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
};
