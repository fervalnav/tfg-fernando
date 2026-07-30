import { wrap } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/postgresql';
import { ControlQuestion } from '../../domain/control-question.entity';
import { MikroOrmControlQuestionRepository } from './mikro-orm-control-question.repository';

jest.mock('@mikro-orm/core', () => ({
  ...jest.requireActual<typeof import('@mikro-orm/core')>('@mikro-orm/core'),
  wrap: jest.fn(),
}));

describe('MikroOrmControlQuestionRepository', () => {
  it('persists the complete AI generation state when updating', async () => {
    const assign = jest.fn();
    jest.mocked(wrap).mockReturnValue({ assign } as never);
    const em = {
      findOne: jest.fn().mockResolvedValue({ id: 'question-id' }),
      flush: jest.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;
    const repository = new MikroOrmControlQuestionRepository(em);
    const question = ControlQuestion.create({
      id: 'question-id',
      accountId: 'account-id',
      opportunityId: 'opportunity-id',
      defaultControlQuestionId: 'template-id',
      question: '¿Cumple?',
      answerType: 'BOOLEAN',
      passConditionPrompt: null,
    });
    question.requestAiGeneration();

    await repository.save(question);

    expect(assign).toHaveBeenCalledWith(
      expect.objectContaining({
        aiStatus: 'PENDING',
        aiError: null,
        aiEvidence: null,
        aiPassed: null,
        aiGeneratedAt: null,
      }),
    );
  });
});
