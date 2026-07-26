import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CreateOpportunityPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useCreateOpportunityMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOpportunityPayload) => api('/opportunities', { method: 'POST', body: payload }),
    onSuccess: (_, { pipelineId }) => {
      void queryClient.invalidateQueries({ queryKey: ['opportunities', 'kanban', pipelineId] });
      void queryClient.invalidateQueries({ queryKey: ['opportunities', 'list'] });
      void queryClient.invalidateQueries({ queryKey: ['opportunities', 'status-totals'] });
    },
  });
};
