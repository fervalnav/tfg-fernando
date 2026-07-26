import { useMutation } from '@tanstack/vue-query';
import type { TransitionOpportunityStatusPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useTransitionStatusMutation = () => {
  const api = useApi();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & TransitionOpportunityStatusPayload) =>
      api(`/opportunities/${id}/status`, { method: 'PATCH', body: payload }),
  });
};
