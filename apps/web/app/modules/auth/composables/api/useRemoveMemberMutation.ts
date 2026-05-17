import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '~/modules/shared/composables/useApi';

export const useRemoveMemberMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api(`/auth/account/members/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
