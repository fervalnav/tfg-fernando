import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { TransitionOpportunityStatusPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useTransitionStatusMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & TransitionOpportunityStatusPayload) =>
      api(`/opportunities/${id}/status`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
};
