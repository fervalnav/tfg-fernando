import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdateOpportunityPositionPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdatePositionMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateOpportunityPositionPayload) =>
      api(`/opportunities/${id}/position`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['opportunities', 'kanban'] });
    },
  });
};
