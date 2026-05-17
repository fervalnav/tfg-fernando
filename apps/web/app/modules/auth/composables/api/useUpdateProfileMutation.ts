import { useMutation } from '@tanstack/vue-query';
import type { UpdateProfilePayload, UserDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

export const useUpdateProfileMutation = () => {
  const api = useApi();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => api<UserDto>('/auth/me', { method: 'PATCH', body: payload }),
    onSuccess: (updatedUser) => {
      authStore.setUser(updatedUser);
    },
  });
};
