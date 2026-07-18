import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { ReorderPipelineStatusesPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useReorderPipelineStatusesMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, ...payload }: { pipelineId: string } & ReorderPipelineStatusesPayload) =>
      api(`/pipelines/${pipelineId}/statuses/positions`, { method: 'PATCH', body: payload }),
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', pipelineId] });
    },
  });
};
