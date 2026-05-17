import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

export const useLogoutMutation = () => {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authStore.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
