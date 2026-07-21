import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CreateDefaultControlQuestionPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useCreateDefaultControlQuestionMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDefaultControlQuestionPayload) =>
      api('/control-questions/defaults', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-control-questions'] });
    },
  });
};
