import { wrap } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/postgresql';
import { Summary } from '../../domain/summary.entity';
import { MikroOrmSummaryRepository } from './mikro-orm-summary.repository';

jest.mock('@mikro-orm/core', () => ({
  ...jest.requireActual<typeof import('@mikro-orm/core')>('@mikro-orm/core'),
  wrap: jest.fn(),
}));

describe('MikroOrmSummaryRepository', () => {
  it('persists the complete AI generation state when updating', async () => {
    const assign = jest.fn();
    jest.mocked(wrap).mockReturnValue({ assign } as never);
    const em = {
      findOne: jest.fn().mockResolvedValue({ id: 'summary-id' }),
      flush: jest.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;
    const repository = new MikroOrmSummaryRepository(em);
    const summary = Summary.create({
      id: 'summary-id',
      accountId: 'account-id',
      opportunityId: 'opportunity-id',
      summaryTemplateId: 'template-id',
      name: 'Resumen',
      prompt: 'Genera un resumen',
    });
    summary.requestAiGeneration();

    await repository.save(summary);

    expect(assign).toHaveBeenCalledWith(
      expect.objectContaining({
        generationStatus: 'PENDING',
        generationError: null,
        generatedAt: null,
      }),
    );
  });
});
