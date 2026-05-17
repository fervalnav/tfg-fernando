import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdateMemberRolePayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdateMemberRoleMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateMemberRolePayload }) =>
      api(`/auth/account/members/${userId}/role`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
