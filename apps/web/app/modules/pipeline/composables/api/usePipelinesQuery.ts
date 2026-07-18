import { useQuery } from '@tanstack/vue-query';
import type { PipelineDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const usePipelinesQuery = () => {
  const api = useApi();

  return useQuery<PipelineDto[], Error>({
    queryKey: ['pipelines'],
    queryFn: () => api<PipelineDto[]>('/pipelines'),
  });
};
