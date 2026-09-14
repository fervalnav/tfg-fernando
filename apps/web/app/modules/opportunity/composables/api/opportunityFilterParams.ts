import type { OpportunityFilters } from '@tfg/types';

export function appendOpportunityFilterParams(params: URLSearchParams, filters: OpportunityFilters): void {
  if (filters.q) params.set('q', filters.q);
  if (filters.statusIds?.length) filters.statusIds.forEach((statusId) => params.append('statusIds', statusId));
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.dueDateFrom) params.set('dueDateFrom', filters.dueDateFrom);
  if (filters.dueDateTo) params.set('dueDateTo', filters.dueDateTo);
  if (filters.amountMin !== undefined) params.set('amountMin', String(filters.amountMin));
  if (filters.amountMax !== undefined) params.set('amountMax', String(filters.amountMax));
  if (filters.customFields?.length) params.set('customFields', JSON.stringify(filters.customFields));
}
