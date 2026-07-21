import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CreateDefaultCustomFieldPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useCreateDefaultCustomFieldMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDefaultCustomFieldPayload) =>
      api('/custom-fields/defaults', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-custom-fields'] });
    },
  });
};
