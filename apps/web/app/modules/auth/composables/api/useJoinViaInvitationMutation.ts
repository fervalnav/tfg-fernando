import { useMutation } from '@tanstack/vue-query';
import type { JoinViaInvitationPayload, AuthResponseDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

export const useJoinViaInvitationMutation = () => {
  const api = useApi();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async (payload: JoinViaInvitationPayload): Promise<AuthResponseDto> => {
      const response = await api<AuthResponseDto>('/auth/accept-invitation/authenticated', {
        method: 'POST',
        body: payload,
      });
      authStore.setUser(response.user);
      return response;
    },
  });
};
