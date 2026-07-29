/* eslint-disable @typescript-eslint/unbound-method */
import { IdService } from '@/shared/domain/services/id.service';
import { Summary } from '../../domain/summary.entity';
import { SummaryRepository } from '../../domain/summary.repository';
import { SummaryTemplate } from '../../domain/summary-template.entity';
import { SummaryTemplateRepository } from '../../domain/summary-template.repository';
import { SummaryTemplateNotFoundException } from '../../domain/exceptions/summary-template-not-found.exception';
import { SummaryFromTemplateService } from './summary-from-template.service';

describe('SummaryFromTemplateService', () => {
  const accountId = '019fa700-0000-7000-8000-000000000201';
  const opportunityId = '019fa700-0000-7000-8000-000000000202';
  const templateId = '019fa700-0000-7000-8000-000000000203';
  const generatedId = '019fa700-0000-7000-8000-000000000204';
  const template = SummaryTemplate.create({
    id: templateId,
    accountId,
    name: 'Resumen ejecutivo',
    prompt: 'Resume los puntos clave',
  });

  function createService(existing: Summary | null) {
    const templates = {
      findById: jest.fn().mockResolvedValue(template),
    } as unknown as jest.Mocked<SummaryTemplateRepository>;
    const summaries = {
      findByOpportunityAndTemplateId: jest.fn().mockResolvedValue(existing),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SummaryRepository>;
    const ids = {
      generate: jest.fn().mockReturnValue(generatedId),
    } as unknown as jest.Mocked<IdService>;

    return {
      service: new SummaryFromTemplateService(templates, summaries, ids),
      templates,
      summaries,
      ids,
    };
  }

  it('returns the existing opportunity summary without duplicating it', async () => {
    const existing = Summary.create({
      id: 'existing-summary',
      accountId,
      opportunityId,
      summaryTemplateId: templateId,
      name: template.name,
      prompt: template.prompt,
    });
    const { service, summaries, ids } = createService(existing);

    const result = await service.createOrGet(templateId, opportunityId, accountId);

    expect(result).toBe(existing);
    expect(summaries.save).not.toHaveBeenCalled();
    expect(ids.generate).not.toHaveBeenCalled();
  });

  it('creates a summary from its template and generates an id when needed', async () => {
    const { service, summaries, ids } = createService(null);

    const result = await service.createOrGet(templateId, opportunityId, accountId);

    expect(result.id).toBe(generatedId);
    expect(result.summaryTemplateId).toBe(templateId);
    expect(result.toPrimitives()).toEqual(
      expect.objectContaining({
        name: template.name,
        prompt: template.prompt,
      }),
    );
    expect(ids.generate).toHaveBeenCalledTimes(1);
    expect(summaries.save).toHaveBeenCalledWith(result);
  });

  it('rejects templates that do not belong to the account', async () => {
    const { service, templates } = createService(null);
    templates.findById.mockResolvedValue(
      SummaryTemplate.create({
        id: templateId,
        accountId: 'another-account',
        name: 'Foreign summary',
        prompt: 'Do not use',
      }),
    );

    await expect(service.createOrGet(templateId, opportunityId, accountId)).rejects.toThrow(
      SummaryTemplateNotFoundException,
    );
  });
});
