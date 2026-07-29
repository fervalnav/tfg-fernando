import { Summary } from './summary.entity';

describe('Summary', () => {
  it('stores the reviewed result without surrounding whitespace', () => {
    const summary = Summary.create({
      id: '019fa500-0000-7000-8000-000000000301',
      accountId: '019fa500-0000-7000-8000-000000000302',
      opportunityId: '019fa500-0000-7000-8000-000000000303',
      summaryTemplateId: '019fa500-0000-7000-8000-000000000304',
      name: 'Resumen ejecutivo',
      prompt: 'Resume la oportunidad',
    });

    summary.updateResult('  Oportunidad viable  ');

    expect(summary.toPrimitives().result).toBe('Oportunidad viable');
  });

  it('rejects an empty result', () => {
    const summary = Summary.create({
      id: '019fa500-0000-7000-8000-000000000311',
      accountId: '019fa500-0000-7000-8000-000000000312',
      opportunityId: '019fa500-0000-7000-8000-000000000313',
      summaryTemplateId: '019fa500-0000-7000-8000-000000000314',
      name: 'Resumen ejecutivo',
      prompt: 'Resume la oportunidad',
    });

    expect(() => summary.updateResult('   ')).toThrow('El resumen no puede estar vacío');
  });
});
