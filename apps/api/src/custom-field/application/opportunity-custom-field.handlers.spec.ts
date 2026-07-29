/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { OpportunityFinder, OpportunityQualificationUpdatedEvent } from '@/opportunity';
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
    const eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const handler = new SetCustomFieldValueHandler(repo, eventBus);

    await handler.execute(new SetCustomFieldValueCommand(opportunityId, accountId, instanceId, 25000));

    expect(field.value).toBe(25000);
    expect(repo.save).toHaveBeenCalledWith(field);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(OpportunityQualificationUpdatedEvent));
  });

  it('rejects updating an instance outside the requested opportunity', async () => {
    const foreign = CustomField.create({
      ...instance().toPrimitives(),
      opportunityId: 'another-opportunity',
    });
    const handler = new SetCustomFieldValueHandler(
      { findById: jest.fn().mockResolvedValue(foreign) } as unknown as CustomFieldRepository,
      { publish: jest.fn() } as unknown as EventBus,
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
});
