import { useApi } from '~/modules/shared/composables/useApi';
import { useQuery } from '@tanstack/vue-query';
import type { WorkflowDetailDto } from '@tfg/types';

export const useWorkflowQuery = (id: MaybeRefOrGetter<string>) => {
  const api = useApi();
  return useQuery<WorkflowDetailDto, Error>({
    queryKey: ['workflows', id],
    queryFn: () => api<WorkflowDetailDto>(`/workflows/${toValue(id)}`),
    enabled: computed(() => !!toValue(id)),
  });
};
