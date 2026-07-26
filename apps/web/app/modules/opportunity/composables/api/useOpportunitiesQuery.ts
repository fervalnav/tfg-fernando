import { useQuery } from '@tanstack/vue-query';
import type { OpportunityDto, PaginatedResult } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

type Filters = {
  pipelineId: string;
  q?: string;
  statusIds?: string[];
  userId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  amountMin?: number;
  amountMax?: number;
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
      if (f.q) params.set('q', f.q);
      if (f.statusIds?.length) f.statusIds.forEach((s) => params.append('statusIds', s));
      if (f.userId) params.set('userId', f.userId);
      if (f.dueDateFrom) params.set('dueDateFrom', f.dueDateFrom);
      if (f.dueDateTo) params.set('dueDateTo', f.dueDateTo);
      if (f.amountMin != null) params.set('amountMin', String(f.amountMin));
      if (f.amountMax != null) params.set('amountMax', String(f.amountMax));
      params.set('page', String(f.page ?? 1));
      params.set('limit', String(f.limit ?? 20));
      return api<PaginatedResult<OpportunityDto>>(`/opportunities?${params}`);
    },
    enabled: computed(() => !!toValue(filters).pipelineId),
  });
};
