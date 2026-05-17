import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

export const useSwitchAccountMutation = () => {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => authStore.switchAccount(accountId),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
