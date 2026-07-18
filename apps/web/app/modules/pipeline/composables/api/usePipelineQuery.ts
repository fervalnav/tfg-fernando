import { useQuery } from '@tanstack/vue-query';
import type { PipelineDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const usePipelineQuery = (id: MaybeRefOrGetter<string>) => {
  const api = useApi();

  return useQuery<PipelineDto, Error>({
    queryKey: ['pipelines', id],
    queryFn: () => api<PipelineDto>(`/pipelines/${toValue(id)}`),
    enabled: computed(() => !!toValue(id)),
  });
};
