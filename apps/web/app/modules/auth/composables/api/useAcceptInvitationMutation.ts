import { useMutation } from '@tanstack/vue-query';
import type { AcceptInvitationPayload, AuthResponseDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

export const useAcceptInvitationMutation = () => {
  const api = useApi();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async (payload: AcceptInvitationPayload): Promise<AuthResponseDto> => {
      const response = await api<AuthResponseDto>('/auth/accept-invitation', {
        method: 'POST',
        body: payload,
      });
      authStore.setUser(response.user);
      return response;
    },
  });
};
