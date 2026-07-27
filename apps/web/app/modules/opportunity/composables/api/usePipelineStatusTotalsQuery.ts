import { useQuery } from '@tanstack/vue-query';
import type { OpportunityFilters, PipelineStatusTotalsDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';
import { appendOpportunityFilterParams } from './opportunityFilterParams';

export const usePipelineStatusTotalsQuery = (
  pipelineId: MaybeRefOrGetter<string>,
  filters: MaybeRefOrGetter<OpportunityFilters>,
) => {
  const api = useApi();
  return useQuery<PipelineStatusTotalsDto[], Error>({
    queryKey: ['opportunities', 'status-totals', pipelineId, filters],
    queryFn: () => {
      const params = new URLSearchParams({ pipelineId: toValue(pipelineId) });
      appendOpportunityFilterParams(params, toValue(filters));
      return api<PipelineStatusTotalsDto[]>(`/opportunities/status-totals?${params}`);
    },
    enabled: computed(() => !!toValue(pipelineId)),
  });
};
