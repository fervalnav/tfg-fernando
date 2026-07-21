import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdateDefaultControlQuestionPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdateDefaultControlQuestionMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateDefaultControlQuestionPayload) =>
      api(`/control-questions/defaults/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-control-questions'] });
    },
  });
};
