import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdatePipelineStatusPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdatePipelineStatusMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pipelineId,
      statusId,
      ...payload
    }: { pipelineId: string; statusId: string } & UpdatePipelineStatusPayload) =>
      api(`/pipelines/${pipelineId}/statuses/${statusId}`, { method: 'PATCH', body: payload }),
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', pipelineId] });
    },
  });
};
