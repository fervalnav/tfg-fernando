import { useApi } from '~/modules/shared/composables/useApi';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CreateWorkflowPayload } from '@tfg/types';

export const useCreateWorkflowMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkflowPayload) => api('/workflows', { method: 'POST', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });
};
