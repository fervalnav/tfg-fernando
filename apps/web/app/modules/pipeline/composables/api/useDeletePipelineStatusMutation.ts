import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '~/modules/shared/composables/useApi';

export const useDeletePipelineStatusMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, statusId }: { pipelineId: string; statusId: string }) =>
      api(`/pipelines/${pipelineId}/statuses/${statusId}`, { method: 'DELETE' }),
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', pipelineId] });
    },
  });
};
