import { useInfiniteQuery } from '@tanstack/vue-query';
import type { DefaultControlQuestionDto, PaginatedResult } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

const LIMIT = 20;

export const useDefaultControlQuestionsQuery = () => {
  const api = useApi();
  return useInfiniteQuery<PaginatedResult<DefaultControlQuestionDto>, Error>({
    queryKey: ['default-control-questions'],
    queryFn: ({ pageParam }) =>
      api<PaginatedResult<DefaultControlQuestionDto>>(
        `/control-questions/defaults?page=${pageParam as number}&limit=${LIMIT}`,
      ),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const loaded = (last.page - 1) * last.limit + last.items.length;
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });
};
