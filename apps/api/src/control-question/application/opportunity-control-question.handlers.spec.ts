/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import {
  OpportunityFinder,
  OpportunityQualificationActionLifecycleService,
  OpportunityQualificationUpdatedEvent,
} from '@/opportunity';
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
import { RequestControlQuestionAiGenerationCommand } from './commands/request-control-question-ai-generation';
import { RequestControlQuestionAiGenerationHandler } from './commands/request-control-question-ai-generation/request-control-question-ai-generation.handler';
import { GenerateControlQuestionAnswerWithAiCommand } from './commands/generate-control-question-answer-with-ai';
import { GenerateControlQuestionAnswerWithAiHandler } from './commands/generate-control-question-answer-with-ai/generate-control-question-answer-with-ai.handler';
import { ControlQuestionAiGenerationRequestedEvent } from './events/control-question-ai.events';

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
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const handler = new AnswerControlQuestionHandler(repo, eventBus);

    await handler.execute(new AnswerControlQuestionCommand(opportunityId, accountId, instanceId, true));

    expect(question.answerValue).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(question);
    expect(eventBus.publishAll).toHaveBeenCalledWith([expect.any(OpportunityQualificationUpdatedEvent)]);
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
      { publishAll: jest.fn() } as unknown as EventBus,
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

  it('requests AI generation and marks the question pending', async () => {
    const question = instance();
    const repo = {
      findById: jest.fn().mockResolvedValue(question),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ControlQuestionRepository>;
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const start = jest.fn().mockResolvedValue(undefined);
    const handler = new RequestControlQuestionAiGenerationHandler(repo, eventBus, {
      start,
    } as unknown as OpportunityQualificationActionLifecycleService);

    await handler.execute(new RequestControlQuestionAiGenerationCommand(opportunityId, accountId, instanceId));

    expect(question.toPrimitives().aiStatus).toBe('PENDING');
    expect(start).toHaveBeenCalledWith(opportunityId, accountId, 'control_question', instanceId);
    expect(eventBus.publishAll).toHaveBeenCalledWith([expect.any(ControlQuestionAiGenerationRequestedEvent)]);
  });

  it('does not enqueue the same question while generation is already pending', async () => {
    const question = instance();
    question.requestAiGeneration();
    question.pullDomainEvents();
    const repo = {
      findById: jest.fn().mockResolvedValue(question),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ControlQuestionRepository>;
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const start = jest.fn();
    const handler = new RequestControlQuestionAiGenerationHandler(repo, eventBus, {
      start,
    } as unknown as OpportunityQualificationActionLifecycleService);

    await handler.execute(new RequestControlQuestionAiGenerationCommand(opportunityId, accountId, instanceId));

    expect(repo.save).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
    expect(eventBus.publishAll).not.toHaveBeenCalled();
  });

  it('stores the generated answer, evidence and pass result', async () => {
    const question = instance();
    question.requestAiGeneration();
    question.pullDomainEvents();
    const repo = {
      findById: jest.fn().mockResolvedValue(question),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ControlQuestionRepository>;
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const handler = new GenerateControlQuestionAnswerWithAiHandler(
      repo,
      {
        find: jest.fn().mockResolvedValue({
          title: 'Oportunidad',
          description: 'Cumple los requisitos',
          amount: null,
          currency: 'EUR',
          dueDate: null,
        }),
      } as unknown as OpportunityFinder,
      {
        generateStructured: jest.fn().mockResolvedValue({
          value: { answer: true, evidence: 'La descripción confirma el requisito', passed: true },
          provider: 'fake',
          model: 'fake',
          durationMs: 1,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        }),
      },
      { find: jest.fn().mockResolvedValue([]) } as never,
      eventBus,
    );

    await handler.execute(new GenerateControlQuestionAnswerWithAiCommand(opportunityId, accountId, instanceId));

    expect(question.toPrimitives()).toEqual(
      expect.objectContaining({
        answer: true,
        aiStatus: 'COMPLETED',
        aiEvidence: 'La descripción confirma el requisito',
        aiPassed: true,
      }),
    );
    expect(eventBus.publishAll).toHaveBeenCalledWith([expect.any(OpportunityQualificationUpdatedEvent)]);
  });
});
