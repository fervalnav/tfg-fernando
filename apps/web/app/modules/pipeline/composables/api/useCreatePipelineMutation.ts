import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CreatePipelinePayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useCreatePipelineMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePipelinePayload) =>
      api('/pipelines', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
};
