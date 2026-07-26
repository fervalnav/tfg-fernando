import { useQuery } from '@tanstack/vue-query';
import type { PaginatedResult, PipelineDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const usePipelinesQuery = () => {
  const api = useApi();

  return useQuery<PipelineDto[], Error>({
    queryKey: ['pipelines'],
    queryFn: async () => {
      const result = await api<PaginatedResult<PipelineDto>>('/pipelines?limit=100');
      return result.items;
    },
  });
};
