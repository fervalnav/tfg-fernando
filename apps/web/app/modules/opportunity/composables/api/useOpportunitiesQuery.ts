import { useQuery } from '@tanstack/vue-query';
import type { OpportunityDto, OpportunityFilters, PaginatedResult } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';
import { appendOpportunityFilterParams } from './opportunityFilterParams';

type Filters = OpportunityFilters & {
  pipelineId: string;
  page?: number;
  limit?: number;
};

export const useOpportunitiesQuery = (filters: MaybeRefOrGetter<Filters>) => {
  const api = useApi();
  return useQuery<PaginatedResult<OpportunityDto>, Error>({
    queryKey: ['opportunities', 'list', filters],
    queryFn: () => {
      const f = toValue(filters);
      const params = new URLSearchParams();
      params.set('pipelineId', f.pipelineId);
      appendOpportunityFilterParams(params, f);
      params.set('page', String(f.page ?? 1));
      params.set('limit', String(f.limit ?? 20));
      return api<PaginatedResult<OpportunityDto>>(`/opportunities?${params}`);
    },
    enabled: computed(() => !!toValue(filters).pipelineId),
  });
};
