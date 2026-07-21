import { useInfiniteQuery } from '@tanstack/vue-query';
import type { DefaultCustomFieldDto, PaginatedResult } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

const LIMIT = 20;

export const useDefaultCustomFieldsQuery = () => {
  const api = useApi();
  return useInfiniteQuery<PaginatedResult<DefaultCustomFieldDto>, Error>({
    queryKey: ['default-custom-fields'],
    queryFn: ({ pageParam }) =>
      api<PaginatedResult<DefaultCustomFieldDto>>(`/custom-fields/defaults?page=${pageParam as number}&limit=${LIMIT}`),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const loaded = (last.page - 1) * last.limit + last.items.length;
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });
};
