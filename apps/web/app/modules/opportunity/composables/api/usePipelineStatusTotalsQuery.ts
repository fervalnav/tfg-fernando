import { useQuery } from '@tanstack/vue-query';
import type { PipelineStatusTotalsDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const usePipelineStatusTotalsQuery = (pipelineId: MaybeRefOrGetter<string>) => {
  const api = useApi();
  return useQuery<PipelineStatusTotalsDto[], Error>({
    queryKey: ['opportunities', 'status-totals', pipelineId],
    queryFn: () => {
      const params = new URLSearchParams({ pipelineId: toValue(pipelineId) });
      return api<PipelineStatusTotalsDto[]>(`/opportunities/status-totals?${params}`);
    },
    enabled: computed(() => !!toValue(pipelineId)),
  });
};
