import { useMutation } from '@tanstack/vue-query';
import type { RegisterPayload } from '@tfg/types';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

export const useRegisterMutation = () => {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authStore.register(payload),
  });
};
