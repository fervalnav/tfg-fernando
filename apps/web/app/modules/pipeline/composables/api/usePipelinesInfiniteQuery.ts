import { useInfiniteQuery } from '@tanstack/vue-query';
import type { PaginatedResult, PipelineDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

const LIMIT = 10;

export const usePipelinesInfiniteQuery = () => {
  const api = useApi();

  return useInfiniteQuery<PaginatedResult<PipelineDto>, Error>({
    queryKey: ['pipelines'],
    queryFn: ({ pageParam }) =>
      api<PaginatedResult<PipelineDto>>(`/pipelines?page=${pageParam as number}&limit=${LIMIT}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = (lastPage.page - 1) * lastPage.limit + lastPage.items.length;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
};
