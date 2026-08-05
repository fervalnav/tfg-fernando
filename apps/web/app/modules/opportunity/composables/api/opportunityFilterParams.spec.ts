import { describe, expect, it } from 'vitest';
import { appendOpportunityFilterParams } from './opportunityFilterParams';

describe('appendOpportunityFilterParams', () => {
  it('serializes every supported opportunity filter without losing repeated statuses', () => {
    const params = new URLSearchParams({ pipelineId: 'pipeline-id' });

    appendOpportunityFilterParams(params, {
      q: 'obra pública',
      statusIds: ['status-1', 'status-2'],
      userId: 'user-id',
      dueDateFrom: '2026-08-01',
      dueDateTo: '2026-08-31',
      amountMin: 0,
      amountMax: 250000,
    });

    expect(params.get('pipelineId')).toBe('pipeline-id');
    expect(params.get('q')).toBe('obra pública');
    expect(params.getAll('statusIds')).toEqual(['status-1', 'status-2']);
    expect(params.get('userId')).toBe('user-id');
    expect(params.get('dueDateFrom')).toBe('2026-08-01');
    expect(params.get('dueDateTo')).toBe('2026-08-31');
    expect(params.get('amountMin')).toBe('0');
    expect(params.get('amountMax')).toBe('250000');
  });

  it('does not add absent filters', () => {
    const params = new URLSearchParams();

    appendOpportunityFilterParams(params, { statusIds: [] });

    expect(params.toString()).toBe('');
  });
});
