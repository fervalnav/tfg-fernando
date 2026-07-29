import { Injectable } from '@nestjs/common';
import { IdService } from '@/shared/domain/services/id.service';
import { Summary } from '../../domain/summary.entity';
import { SummaryRepository } from '../../domain/summary.repository';
import { SummaryTemplateRepository } from '../../domain/summary-template.repository';
import { SummaryTemplateNotFoundException } from '../../domain/exceptions/summary-template-not-found.exception';

@Injectable()
export class SummaryFromTemplateService {
  constructor(
    private readonly templates: SummaryTemplateRepository,
    private readonly summaries: SummaryRepository,
    private readonly ids: IdService,
  ) {}

  async createOrGet(
    summaryTemplateId: string,
    opportunityId: string,
    accountId: string,
    instanceId?: string,
  ): Promise<Summary> {
    const [template, existing] = await Promise.all([
      this.templates.findById(summaryTemplateId),
      this.summaries.findByOpportunityAndTemplateId(opportunityId, summaryTemplateId),
    ]);
    if (!template || template.accountId !== accountId) {
      throw new SummaryTemplateNotFoundException(summaryTemplateId);
    }
    if (existing) return existing;

    const summary = Summary.create({
      id: instanceId ?? this.ids.generate(),
      accountId,
      opportunityId,
      summaryTemplateId,
      name: template.name,
      prompt: template.prompt,
    });
    await this.summaries.save(summary);
    return summary;
  }
}
