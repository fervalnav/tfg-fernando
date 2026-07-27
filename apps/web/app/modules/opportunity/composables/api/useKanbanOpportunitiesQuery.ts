import { useQuery } from '@tanstack/vue-query';
import type { OpportunityDto, OpportunityFilters } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';
import { appendOpportunityFilterParams } from './opportunityFilterParams';

export const useKanbanOpportunitiesQuery = (
  pipelineId: MaybeRefOrGetter<string>,
  filters: MaybeRefOrGetter<OpportunityFilters>,
) => {
  const api = useApi();
  return useQuery<OpportunityDto[], Error>({
    queryKey: ['opportunities', 'kanban', pipelineId, filters],
    queryFn: () => {
      const params = new URLSearchParams({ pipelineId: toValue(pipelineId) });
      appendOpportunityFilterParams(params, toValue(filters));
      return api<OpportunityDto[]>(`/opportunities/kanban?${params}`);
    },
    enabled: computed(() => !!toValue(pipelineId)),
  });
};
