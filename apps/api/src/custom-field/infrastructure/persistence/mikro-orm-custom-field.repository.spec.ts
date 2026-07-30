import { wrap } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/postgresql';
import { CustomField } from '../../domain/custom-field.entity';
import { MikroOrmCustomFieldRepository } from './mikro-orm-custom-field.repository';

jest.mock('@mikro-orm/core', () => ({
  ...jest.requireActual<typeof import('@mikro-orm/core')>('@mikro-orm/core'),
  wrap: jest.fn(),
}));

describe('MikroOrmCustomFieldRepository', () => {
  it('persists the complete AI generation state when updating', async () => {
    const assign = jest.fn();
    jest.mocked(wrap).mockReturnValue({ assign } as never);
    const em = {
      findOne: jest.fn().mockResolvedValue({ id: 'field-id' }),
      flush: jest.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;
    const repository = new MikroOrmCustomFieldRepository(em);
    const field = CustomField.create({
      id: 'field-id',
      accountId: 'account-id',
      opportunityId: 'opportunity-id',
      defaultCustomFieldId: 'template-id',
      name: 'Importe',
      description: null,
      type: 'NUMBER',
      classifiers: [],
      canSelectMultiple: false,
      automatic: true,
      aiPrompt: 'Extrae el importe',
    });
    field.requestAiGeneration();

    await repository.save(field);

    expect(assign).toHaveBeenCalledWith(
      expect.objectContaining({
        aiStatus: 'PENDING',
        aiError: null,
        aiEvidence: null,
        aiGeneratedAt: null,
      }),
    );
  });
});
