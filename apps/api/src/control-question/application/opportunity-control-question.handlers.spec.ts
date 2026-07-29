/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { OpportunityFinder, OpportunityQualificationUpdatedEvent } from '@/opportunity';
import { AddControlQuestionToOpportunityCommand } from './commands/add-control-question-to-opportunity/add-control-question-to-opportunity.command';
import { AddControlQuestionToOpportunityHandler } from './commands/add-control-question-to-opportunity/add-control-question-to-opportunity.handler';
import { AnswerControlQuestionCommand } from './commands/answer-control-question/answer-control-question.command';
import { AnswerControlQuestionHandler } from './commands/answer-control-question/answer-control-question.handler';
import { FindOpportunityControlQuestionsHandler } from './queries/find-opportunity-control-questions/find-opportunity-control-questions.handler';
import { FindOpportunityControlQuestionsQuery } from './queries/find-opportunity-control-questions/find-opportunity-control-questions.query';
import { ControlQuestionFromDefaultService } from './services/control-question-from-default.service';
import { ControlQuestion } from '../domain/control-question.entity';
import { ControlQuestionRepository } from '../domain/control-question.repository';
import { ControlQuestionNotFoundException } from '../domain/exceptions/control-question-not-found.exception';

describe('opportunity control-question use cases', () => {
  const accountId = 'account-id';
  const opportunityId = 'opportunity-id';
  const instanceId = 'question-id';
  const templateId = 'template-id';

  function instance() {
    return ControlQuestion.create({
      id: instanceId,
      accountId,
      opportunityId,
      defaultControlQuestionId: templateId,
      question: '¿Cumple?',
      answerType: 'BOOLEAN',
      passConditionPrompt: 'Debe ser afirmativo',
    });
  }

  it('validates the opportunity and delegates adding a template instance', async () => {
    const find = jest.fn().mockResolvedValue({});
    const createOrGet = jest.fn().mockResolvedValue(instance());
    const handler = new AddControlQuestionToOpportunityHandler(
      { createOrGet } as unknown as ControlQuestionFromDefaultService,
      { find } as unknown as OpportunityFinder,
    );

    await handler.execute(new AddControlQuestionToOpportunityCommand(instanceId, opportunityId, accountId, templateId));

    expect(find).toHaveBeenCalledWith(opportunityId, accountId);
    expect(createOrGet).toHaveBeenCalledWith(templateId, opportunityId, accountId, instanceId);
  });

  it('answers an owned instance, persists it and publishes its qualification update', async () => {
    const question = instance();
    const repo = {
      findById: jest.fn().mockResolvedValue(question),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ControlQuestionRepository>;
    const eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const handler = new AnswerControlQuestionHandler(repo, eventBus);

    await handler.execute(new AnswerControlQuestionCommand(opportunityId, accountId, instanceId, true));

    expect(question.answerValue).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(question);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(OpportunityQualificationUpdatedEvent));
  });

  it('rejects answering an instance outside the requested opportunity', async () => {
    const foreign = ControlQuestion.create({
      id: instanceId,
      accountId,
      opportunityId: 'another-opportunity',
      defaultControlQuestionId: templateId,
      question: '¿Cumple?',
      answerType: 'BOOLEAN',
      passConditionPrompt: null,
    });
    const handler = new AnswerControlQuestionHandler(
      { findById: jest.fn().mockResolvedValue(foreign) } as unknown as ControlQuestionRepository,
      { publish: jest.fn() } as unknown as EventBus,
    );

    await expect(
      handler.execute(new AnswerControlQuestionCommand(opportunityId, accountId, instanceId, true)),
    ).rejects.toThrow(ControlQuestionNotFoundException);
  });

  it('maps only the opportunity instances returned by the repository', async () => {
    const repo = {
      findByOpportunityId: jest.fn().mockResolvedValue([instance()]),
    } as unknown as jest.Mocked<ControlQuestionRepository>;
    const handler = new FindOpportunityControlQuestionsHandler(repo);

    const result = await handler.execute(new FindOpportunityControlQuestionsQuery(opportunityId, accountId));

    expect(repo.findByOpportunityId).toHaveBeenCalledWith(opportunityId, accountId);
    expect(result).toEqual([expect.objectContaining({ id: instanceId, question: '¿Cumple?' })]);
  });
});
