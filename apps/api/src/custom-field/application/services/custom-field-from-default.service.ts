import { Injectable } from '@nestjs/common';
import { IdService } from '@/shared/domain/services/id.service';
import { CustomField } from '../../domain/custom-field.entity';
import { CustomFieldRepository } from '../../domain/custom-field.repository';
import { DefaultCustomFieldRepository } from '../../domain/default-custom-field.repository';
import { DefaultCustomFieldNotFoundException } from '../../domain/exceptions/default-custom-field-not-found.exception';

@Injectable()
export class CustomFieldFromDefaultService {
  constructor(
    private readonly defaults: DefaultCustomFieldRepository,
    private readonly instances: CustomFieldRepository,
    private readonly ids: IdService,
  ) {}

  async createOrGet(
    defaultCustomFieldId: string,
    opportunityId: string,
    accountId: string,
    instanceId?: string,
  ): Promise<CustomField> {
    const [template, existing] = await Promise.all([
      this.defaults.findById(defaultCustomFieldId),
      this.instances.findByOpportunityAndDefaultId(opportunityId, defaultCustomFieldId),
    ]);
    if (!template || template.accountId !== accountId) {
      throw new DefaultCustomFieldNotFoundException(defaultCustomFieldId);
    }
    if (existing) return existing;

    const instance = CustomField.create({
      id: instanceId ?? this.ids.generate(),
      accountId,
      opportunityId,
      defaultCustomFieldId,
      name: template.name,
      description: template.description,
      type: template.type,
      classifiers: template.classifiers,
      canSelectMultiple: template.canSelectMultiple,
      automatic: template.automatic,
      aiPrompt: template.aiPrompt,
    });
    await this.instances.save(instance);
    return instance;
  }
}
