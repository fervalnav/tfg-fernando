import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePipelinesInfiniteQuery } from './usePipelinesInfiniteQuery';
import { usePipelinesQuery } from './usePipelinesQuery';

const { useInfiniteQueryMock, useQueryMock } = vi.hoisted(() => ({
  useInfiniteQueryMock: vi.fn((options: unknown) => options),
  useQueryMock: vi.fn((options: unknown) => options),
}));

vi.mock('@tanstack/vue-query', () => ({
  useInfiniteQuery: useInfiniteQueryMock,
  useQuery: useQueryMock,
}));

vi.mock('~/modules/shared/composables/useApi', () => ({
  useApi: () => vi.fn(),
}));

describe('pipeline queries', () => {
  beforeEach(() => {
    useInfiniteQueryMock.mockClear();
    useQueryMock.mockClear();
  });

  it('keeps finite and infinite results in separate cache entries', () => {
    usePipelinesQuery();
    usePipelinesInfiniteQuery();

    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['pipelines', 'all'] }));
    expect(useInfiniteQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['pipelines', 'infinite'], initialPageParam: 1 }),
    );
  });
});
