import { useApi } from '~/modules/shared/composables/useApi';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdateWorkflowPayload } from '@tfg/types';

export const useUpdateWorkflowMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateWorkflowPayload & { id: string }) =>
      api(`/workflows/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workflows', id] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};
