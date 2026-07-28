import { useQuery } from '@tanstack/vue-query';
import type { OpportunityDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useOpportunityByIdQuery = (id: MaybeRefOrGetter<string>) => {
  const api = useApi();
  return useQuery<OpportunityDto, Error>({
    queryKey: ['opportunities', 'detail', id],
    queryFn: () => api<OpportunityDto>(`/opportunities/${toValue(id)}`),
    enabled: computed(() => Boolean(toValue(id))),
  });
};
