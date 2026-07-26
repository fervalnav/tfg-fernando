import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdateOpportunityPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdateOpportunityMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateOpportunityPayload) =>
      api(`/opportunities/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
};
