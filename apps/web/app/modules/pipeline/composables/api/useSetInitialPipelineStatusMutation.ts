import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '~/modules/shared/composables/useApi';

export const useSetInitialPipelineStatusMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, statusId }: { pipelineId: string; statusId: string }) =>
      api(`/pipelines/${pipelineId}/statuses/${statusId}/initial`, { method: 'PATCH' }),
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', pipelineId] });
    },
  });
};
