import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdatePipelinePayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdatePipelineMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdatePipelinePayload) =>
      api(`/pipelines/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', id] });
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
};
