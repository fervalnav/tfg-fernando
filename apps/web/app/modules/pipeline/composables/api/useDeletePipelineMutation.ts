import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '~/modules/shared/composables/useApi';

export const useDeletePipelineMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api(`/pipelines/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['pipelines', id] });
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
};
