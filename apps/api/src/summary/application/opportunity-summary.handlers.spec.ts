/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { OpportunityFinder, OpportunityQualificationUpdatedEvent } from '@/opportunity';
import { AddSummaryToOpportunityCommand } from './commands/add-summary-to-opportunity/add-summary-to-opportunity.command';
import { AddSummaryToOpportunityHandler } from './commands/add-summary-to-opportunity/add-summary-to-opportunity.handler';
import { UpdateSummaryResultCommand } from './commands/update-summary-result/update-summary-result.command';
import { UpdateSummaryResultHandler } from './commands/update-summary-result/update-summary-result.handler';
import { FindOpportunitySummariesHandler } from './queries/find-opportunity-summaries/find-opportunity-summaries.handler';
import { FindOpportunitySummariesQuery } from './queries/find-opportunity-summaries/find-opportunity-summaries.query';
import { SummaryFromTemplateService } from './services/summary-from-template.service';
import { Summary } from '../domain/summary.entity';
import { SummaryRepository } from '../domain/summary.repository';
import { SummaryNotFoundException } from '../domain/exceptions/summary-not-found.exception';

describe('opportunity summary use cases', () => {
  const accountId = 'account-id';
  const opportunityId = 'opportunity-id';
  const instanceId = 'summary-id';
  const templateId = 'template-id';

  function instance() {
    return Summary.create({
      id: instanceId,
      accountId,
      opportunityId,
      summaryTemplateId: templateId,
      name: 'Resumen ejecutivo',
      prompt: 'Resume la oportunidad',
    });
  }

  it('validates the opportunity and delegates adding a template instance', async () => {
    const find = jest.fn().mockResolvedValue({});
    const createOrGet = jest.fn().mockResolvedValue(instance());
    const handler = new AddSummaryToOpportunityHandler(
      { createOrGet } as unknown as SummaryFromTemplateService,
      { find } as unknown as OpportunityFinder,
    );

    await handler.execute(new AddSummaryToOpportunityCommand(instanceId, opportunityId, accountId, templateId));

    expect(find).toHaveBeenCalledWith(opportunityId, accountId);
    expect(createOrGet).toHaveBeenCalledWith(templateId, opportunityId, accountId, instanceId);
  });

  it('updates an owned result, persists it and publishes its qualification update', async () => {
    const summary = instance();
    const repo = {
      findById: jest.fn().mockResolvedValue(summary),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SummaryRepository>;
    const eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const handler = new UpdateSummaryResultHandler(repo, eventBus);

    await handler.execute(new UpdateSummaryResultCommand(opportunityId, accountId, instanceId, '  Resultado  '));

    expect(summary.toPrimitives().result).toBe('Resultado');
    expect(repo.save).toHaveBeenCalledWith(summary);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(OpportunityQualificationUpdatedEvent));
  });

  it('rejects updating an instance outside the requested opportunity', async () => {
    const foreign = Summary.create({
      id: instanceId,
      accountId,
      opportunityId: 'another-opportunity',
      summaryTemplateId: templateId,
      name: 'Resumen ejecutivo',
      prompt: 'Resume la oportunidad',
    });
    const handler = new UpdateSummaryResultHandler(
      { findById: jest.fn().mockResolvedValue(foreign) } as unknown as SummaryRepository,
      { publish: jest.fn() } as unknown as EventBus,
    );

    await expect(
      handler.execute(new UpdateSummaryResultCommand(opportunityId, accountId, instanceId, 'Resultado')),
    ).rejects.toThrow(SummaryNotFoundException);
  });

  it('maps only the opportunity instances returned by the repository', async () => {
    const repo = {
      findByOpportunityId: jest.fn().mockResolvedValue([instance()]),
    } as unknown as jest.Mocked<SummaryRepository>;
    const handler = new FindOpportunitySummariesHandler(repo);

    const result = await handler.execute(new FindOpportunitySummariesQuery(opportunityId, accountId));

    expect(repo.findByOpportunityId).toHaveBeenCalledWith(opportunityId, accountId);
    expect(result).toEqual([expect.objectContaining({ id: instanceId, name: 'Resumen ejecutivo' })]);
  });
});
