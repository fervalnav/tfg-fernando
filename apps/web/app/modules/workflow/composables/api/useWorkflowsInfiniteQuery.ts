import { useApi } from '~/modules/shared/composables/useApi';
import { useInfiniteQuery } from '@tanstack/vue-query';
import type { PaginatedResult, WorkflowDto } from '@tfg/types';

export const useWorkflowsInfiniteQuery = () => {
  const api = useApi();
  return useInfiniteQuery<PaginatedResult<WorkflowDto>, Error>({
    queryKey: ['workflows'],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: '20' });
      return api<PaginatedResult<WorkflowDto>>(`/workflows?${params}`);
    },
    initialPageParam: 1,
    getNextPageParam: (last, pages) => {
      const loaded = pages.flatMap((p) => p.items).length;
      return loaded < last.total ? pages.length + 1 : undefined;
    },
  });
};
