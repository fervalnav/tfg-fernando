import { useMutation } from '@tanstack/vue-query';
import type { UpdateOpportunityPositionPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdatePositionMutation = () => {
  const api = useApi();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateOpportunityPositionPayload) =>
      api(`/opportunities/${id}/position`, { method: 'PATCH', body: payload }),
  });
};
