import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { InviteMemberPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useInviteMemberMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteMemberPayload) =>
      api('/auth/account/members/invite', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
