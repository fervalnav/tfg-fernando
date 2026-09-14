import { BadRequestException } from '@nestjs/common';
import { parseOpportunityFilters } from './opportunity.controller';

describe('parseOpportunityFilters', () => {
  it.each([null, 7, [], { type: '__proto__' }, { fieldId: 7, type: 'TEXT' }])(
    'rejects malformed filter entries with a client error: %j',
    (filter) => {
      expect(() =>
        parseOpportunityFilters(
          'account',
          'pipeline',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          JSON.stringify([filter]),
        ),
      ).toThrow(BadRequestException);
    },
  );

  it('rejects calendar dates that do not exist', () => {
    expect(() =>
      parseOpportunityFilters(
        'account',
        'pipeline',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        JSON.stringify([
          { fieldId: '0198f6b3-1fd7-7fba-8e79-53161b649953', type: 'DATE', operator: 'BEFORE', value: '2026-02-30' },
        ]),
      ),
    ).toThrow(BadRequestException);
  });

  it('accepts typed custom-field filters', () => {
    const filters = parseOpportunityFilters(
      'account',
      'pipeline',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      JSON.stringify([
        { fieldId: '0198f6b3-1fd7-7fba-8e79-53161b649953', type: 'NUMBER', operator: 'GREATER_THAN', value: 100 },
      ]),
    );
    expect(filters.customFields).toHaveLength(1);
  });

  it('rejects operators that do not belong to the field type', () => {
    expect(() =>
      parseOpportunityFilters(
        'account',
        'pipeline',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        JSON.stringify([
          { fieldId: '0198f6b3-1fd7-7fba-8e79-53161b649953', type: 'BOOLEAN', operator: 'GREATER_THAN', value: true },
        ]),
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects duplicate fields and malformed dates', () => {
    const fieldId = '0198f6b3-1fd7-7fba-8e79-53161b649953';
    const invalid = [
      { fieldId, type: 'DATE', operator: 'BEFORE', value: 'mañana' },
      { fieldId, type: 'DATE', operator: 'AFTER', value: '2026-09-11' },
    ];
    expect(() =>
      parseOpportunityFilters(
        'account',
        'pipeline',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        JSON.stringify(invalid),
      ),
    ).toThrow(BadRequestException);
  });
});
