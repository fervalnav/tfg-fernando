import { useMutation } from '@tanstack/vue-query';
import type { LoginPayload } from '@tfg/types';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

export const useLoginMutation = () => {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authStore.login(payload),
  });
};
