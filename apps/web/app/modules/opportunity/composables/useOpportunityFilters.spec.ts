import { reactive } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useOpportunityFilters } from './useOpportunityFilters';

const route = reactive({
  query: {} as Record<string, string | string[] | undefined>,
});
const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

mockNuxtImport('useRoute', () => () => route);
mockNuxtImport('useRouter', () => () => ({ push: pushMock }));

describe('useOpportunityFilters', () => {
  beforeEach(() => {
    route.query = {};
    pushMock.mockReset();
  });

  it('reads URL filters with arrays and numeric limits', () => {
    route.query = {
      q: 'búnker',
      statusIds: ['analysis', 'proposal'],
      amountMin: '0',
      amountMax: '90000',
      customFields: JSON.stringify([{ fieldId: 'field', type: 'BOOLEAN', operator: 'EQUALS', value: true }]),
    };

    const result = useOpportunityFilters();

    expect(result.filters.value).toEqual({
      q: 'búnker',
      statusIds: ['analysis', 'proposal'],
      userId: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
      amountMin: 0,
      amountMax: 90000,
      customFields: [{ fieldId: 'field', type: 'BOOLEAN', operator: 'EQUALS', value: true }],
    });
    expect(result.hasActiveFilters.value).toBe(true);
  });

  it('preserves unrelated query parameters when changing one filter', () => {
    route.query = { page: '2', q: 'anterior' };
    const result = useOpportunityFilters();

    result.setFilter('statusIds', ['one', 'two']);

    expect(pushMock).toHaveBeenCalledWith({
      query: { page: '2', q: 'anterior', statusIds: ['one', 'two'] },
    });
  });

  it('removes empty values and can reset the complete query', () => {
    route.query = { q: 'texto', userId: 'user-id' };
    const result = useOpportunityFilters();

    result.setFilter('q', '');
    expect(pushMock).toHaveBeenCalledWith({ query: { userId: 'user-id' } });

    result.resetFilters();
    expect(pushMock).toHaveBeenLastCalledWith({ query: {} });
  });
});
