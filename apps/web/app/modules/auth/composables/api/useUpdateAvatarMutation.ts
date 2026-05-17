import { useMutation } from '@tanstack/vue-query';
import { useApi } from '~/modules/shared/composables/useApi';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

export const useUpdateAvatarMutation = () => {
  const api = useApi();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async (file: File): Promise<{ avatarUrl: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      return api<{ avatarUrl: string }>('/auth/me/avatar', { method: 'PATCH', body: formData });
    },
    onSuccess: ({ avatarUrl }) => {
      const user = authStore.currentUser;
      if (user) authStore.setUser({ ...user, avatarUrl });
    },
  });
};
