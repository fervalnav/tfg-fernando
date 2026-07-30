/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import {
  OpportunityFinder,
  OpportunityQualificationActionLifecycleService,
  OpportunityQualificationUpdatedEvent,
} from '@/opportunity';
import { AddCustomFieldToOpportunityCommand } from './commands/add-custom-field-to-opportunity/add-custom-field-to-opportunity.command';
import { AddCustomFieldToOpportunityHandler } from './commands/add-custom-field-to-opportunity/add-custom-field-to-opportunity.handler';
import { SetCustomFieldValueCommand } from './commands/set-custom-field-value/set-custom-field-value.command';
import { SetCustomFieldValueHandler } from './commands/set-custom-field-value/set-custom-field-value.handler';
import { FindOpportunityCustomFieldsHandler } from './queries/find-opportunity-custom-fields/find-opportunity-custom-fields.handler';
import { FindOpportunityCustomFieldsQuery } from './queries/find-opportunity-custom-fields/find-opportunity-custom-fields.query';
import { CustomFieldFromDefaultService } from './services/custom-field-from-default.service';
import { CustomField } from '../domain/custom-field.entity';
import { CustomFieldRepository } from '../domain/custom-field.repository';
import { CustomFieldNotFoundException } from '../domain/exceptions/custom-field-not-found.exception';
import { CustomFieldAiGenerationUnavailableException } from '../domain/exceptions/custom-field-ai-generation-unavailable.exception';
import { RequestCustomFieldAiGenerationCommand } from './commands/request-custom-field-ai-generation';
import { RequestCustomFieldAiGenerationHandler } from './commands/request-custom-field-ai-generation/request-custom-field-ai-generation.handler';
import { GenerateCustomFieldValueWithAiCommand } from './commands/generate-custom-field-value-with-ai';
import { GenerateCustomFieldValueWithAiHandler } from './commands/generate-custom-field-value-with-ai/generate-custom-field-value-with-ai.handler';
import { CustomFieldAiGenerationRequestedEvent } from './events/custom-field-ai.events';

describe('opportunity custom-field use cases', () => {
  const accountId = 'account-id';
  const opportunityId = 'opportunity-id';
  const instanceId = 'field-id';
  const templateId = 'template-id';

  function instance() {
    return CustomField.create({
      id: instanceId,
      accountId,
      opportunityId,
      defaultCustomFieldId: templateId,
      name: 'Importe',
      description: null,
      type: 'NUMBER',
      classifiers: [],
      canSelectMultiple: false,
      automatic: false,
      aiPrompt: null,
    });
  }

  function automaticInstance() {
    return CustomField.create({
      id: instanceId,
      accountId,
      opportunityId,
      defaultCustomFieldId: templateId,
      name: 'Importe estimado',
      description: null,
      type: 'NUMBER',
      classifiers: [],
      canSelectMultiple: false,
      automatic: true,
      aiPrompt: 'Obtén el importe de la oportunidad',
    });
  }

  it('validates the opportunity and delegates adding a template instance', async () => {
    const find = jest.fn().mockResolvedValue({});
    const createOrGet = jest.fn().mockResolvedValue(instance());
    const handler = new AddCustomFieldToOpportunityHandler(
      { createOrGet } as unknown as CustomFieldFromDefaultService,
      { find } as unknown as OpportunityFinder,
    );

    await handler.execute(new AddCustomFieldToOpportunityCommand(instanceId, opportunityId, accountId, templateId));

    expect(find).toHaveBeenCalledWith(opportunityId, accountId);
    expect(createOrGet).toHaveBeenCalledWith(templateId, opportunityId, accountId, instanceId);
  });

  it('sets an owned value, persists it and publishes its qualification update', async () => {
    const field = instance();
    const repo = {
      findById: jest.fn().mockResolvedValue(field),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CustomFieldRepository>;
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const handler = new SetCustomFieldValueHandler(repo, eventBus);

    await handler.execute(new SetCustomFieldValueCommand(opportunityId, accountId, instanceId, 25000));

    expect(field.value).toBe(25000);
    expect(repo.save).toHaveBeenCalledWith(field);
    expect(eventBus.publishAll).toHaveBeenCalledWith([expect.any(OpportunityQualificationUpdatedEvent)]);
  });

  it('rejects updating an instance outside the requested opportunity', async () => {
    const foreign = CustomField.create({
      ...instance().toPrimitives(),
      opportunityId: 'another-opportunity',
    });
    const handler = new SetCustomFieldValueHandler(
      { findById: jest.fn().mockResolvedValue(foreign) } as unknown as CustomFieldRepository,
      { publishAll: jest.fn() } as unknown as EventBus,
    );

    await expect(
      handler.execute(new SetCustomFieldValueCommand(opportunityId, accountId, instanceId, 25000)),
    ).rejects.toThrow(CustomFieldNotFoundException);
  });

  it('maps only the opportunity instances returned by the repository', async () => {
    const repo = {
      findByOpportunityId: jest.fn().mockResolvedValue([instance()]),
    } as unknown as jest.Mocked<CustomFieldRepository>;
    const handler = new FindOpportunityCustomFieldsHandler(repo);

    const result = await handler.execute(new FindOpportunityCustomFieldsQuery(opportunityId, accountId));

    expect(repo.findByOpportunityId).toHaveBeenCalledWith(opportunityId, accountId);
    expect(result).toEqual([expect.objectContaining({ id: instanceId, name: 'Importe' })]);
  });

  it('rejects AI generation for a field that is not automatic', async () => {
    const handler = new RequestCustomFieldAiGenerationHandler(
      { findById: jest.fn().mockResolvedValue(instance()) } as unknown as CustomFieldRepository,
      { publishAll: jest.fn() } as unknown as EventBus,
      { start: jest.fn() } as unknown as OpportunityQualificationActionLifecycleService,
    );

    await expect(
      handler.execute(new RequestCustomFieldAiGenerationCommand(opportunityId, accountId, instanceId)),
    ).rejects.toThrow(CustomFieldAiGenerationUnavailableException);
  });

  it('requests AI generation for an automatic field', async () => {
    const field = automaticInstance();
    const repo = {
      findById: jest.fn().mockResolvedValue(field),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CustomFieldRepository>;
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const start = jest.fn().mockResolvedValue(undefined);
    const handler = new RequestCustomFieldAiGenerationHandler(repo, eventBus, {
      start,
    } as unknown as OpportunityQualificationActionLifecycleService);

    await handler.execute(new RequestCustomFieldAiGenerationCommand(opportunityId, accountId, instanceId));

    expect(field.toPrimitives().aiStatus).toBe('PENDING');
    expect(start).toHaveBeenCalledWith(opportunityId, accountId, 'custom_field', instanceId);
    expect(eventBus.publishAll).toHaveBeenCalledWith([expect.any(CustomFieldAiGenerationRequestedEvent)]);
  });

  it('does not enqueue the same automatic field while generation is already pending', async () => {
    const field = automaticInstance();
    field.requestAiGeneration();
    field.pullDomainEvents();
    const repo = {
      findById: jest.fn().mockResolvedValue(field),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CustomFieldRepository>;
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const start = jest.fn();
    const handler = new RequestCustomFieldAiGenerationHandler(repo, eventBus, {
      start,
    } as unknown as OpportunityQualificationActionLifecycleService);

    await handler.execute(new RequestCustomFieldAiGenerationCommand(opportunityId, accountId, instanceId));

    expect(repo.save).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
    expect(eventBus.publishAll).not.toHaveBeenCalled();
  });

  it('validates and persists the generated field value', async () => {
    const field = automaticInstance();
    field.requestAiGeneration();
    field.pullDomainEvents();
    const repo = {
      findById: jest.fn().mockResolvedValue(field),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CustomFieldRepository>;
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const handler = new GenerateCustomFieldValueWithAiHandler(
      repo,
      {
        find: jest.fn().mockResolvedValue({
          title: 'Oportunidad',
          description: 'Contrato de 25000 euros',
          amount: 25000,
          currency: 'EUR',
          dueDate: null,
        }),
      } as unknown as OpportunityFinder,
      {
        generateStructured: jest.fn().mockResolvedValue({
          value: { value: 25000, evidence: 'El importe figura en la oportunidad' },
          provider: 'fake',
          model: 'fake',
          durationMs: 1,
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        }),
      },
      { find: jest.fn().mockResolvedValue([]) } as never,
      eventBus,
    );

    await handler.execute(new GenerateCustomFieldValueWithAiCommand(opportunityId, accountId, instanceId));

    expect(field.toPrimitives()).toEqual(
      expect.objectContaining({
        value: 25000,
        aiStatus: 'COMPLETED',
        aiEvidence: 'El importe figura en la oportunidad',
      }),
    );
    expect(eventBus.publishAll).toHaveBeenCalledWith([expect.any(OpportunityQualificationUpdatedEvent)]);
  });
});
