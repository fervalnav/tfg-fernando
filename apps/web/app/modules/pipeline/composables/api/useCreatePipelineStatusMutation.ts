import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CreatePipelineStatusPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useCreatePipelineStatusMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, ...payload }: { pipelineId: string } & CreatePipelineStatusPayload) =>
      api(`/pipelines/${pipelineId}/statuses`, { method: 'POST', body: payload }),
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', pipelineId] });
    },
  });
};
