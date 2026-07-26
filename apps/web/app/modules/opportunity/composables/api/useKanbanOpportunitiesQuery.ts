import { useQuery } from '@tanstack/vue-query';
import type { OpportunityDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useKanbanOpportunitiesQuery = (pipelineId: MaybeRefOrGetter<string>) => {
  const api = useApi();
  return useQuery<OpportunityDto[], Error>({
    queryKey: ['opportunities', 'kanban', pipelineId],
    queryFn: () => {
      const params = new URLSearchParams({ pipelineId: toValue(pipelineId) });
      return api<OpportunityDto[]>(`/opportunities/kanban?${params}`);
    },
    enabled: computed(() => !!toValue(pipelineId)),
  });
};
