/* eslint-disable @typescript-eslint/unbound-method */
import { IdService } from '@/shared/domain/services/id.service';
import { CustomField } from '../../domain/custom-field.entity';
import { CustomFieldRepository } from '../../domain/custom-field.repository';
import { DefaultCustomField } from '../../domain/default-custom-field.entity';
import { DefaultCustomFieldRepository } from '../../domain/default-custom-field.repository';
import { DefaultCustomFieldNotFoundException } from '../../domain/exceptions/default-custom-field-not-found.exception';
import { CustomFieldFromDefaultService } from './custom-field-from-default.service';

describe('CustomFieldFromDefaultService', () => {
  const accountId = '019fa700-0000-7000-8000-000000000101';
  const opportunityId = '019fa700-0000-7000-8000-000000000102';
  const templateId = '019fa700-0000-7000-8000-000000000103';
  const generatedId = '019fa700-0000-7000-8000-000000000104';
  const template = DefaultCustomField.create({
    id: templateId,
    accountId,
    name: 'Certificaciones',
    description: 'Certificaciones requeridas',
    type: 'CLASSIFIER',
    classifiers: ['ISO 9001', 'ISO 14001'],
    canSelectMultiple: true,
    automatic: true,
    aiPrompt: 'Detecta las certificaciones',
  });

  function createService(existing: CustomField | null) {
    const defaults = {
      findById: jest.fn().mockResolvedValue(template),
    } as unknown as jest.Mocked<DefaultCustomFieldRepository>;
    const instances = {
      findByOpportunityAndDefaultId: jest.fn().mockResolvedValue(existing),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CustomFieldRepository>;
    const ids = {
      generate: jest.fn().mockReturnValue(generatedId),
    } as unknown as jest.Mocked<IdService>;

    return {
      service: new CustomFieldFromDefaultService(defaults, instances, ids),
      defaults,
      instances,
      ids,
    };
  }

  it('returns the existing opportunity instance without duplicating it', async () => {
    const existing = CustomField.create({
      id: 'existing-field',
      accountId,
      opportunityId,
      defaultCustomFieldId: templateId,
      name: template.name,
      description: template.description,
      type: template.type,
      classifiers: template.classifiers,
      canSelectMultiple: template.canSelectMultiple,
      automatic: template.automatic,
      aiPrompt: template.aiPrompt,
    });
    const { service, instances, ids } = createService(existing);

    const result = await service.createOrGet(templateId, opportunityId, accountId);

    expect(result).toBe(existing);
    expect(instances.save).not.toHaveBeenCalled();
    expect(ids.generate).not.toHaveBeenCalled();
  });

  it('creates a field from its template with the explicitly supplied instance id', async () => {
    const { service, instances, ids } = createService(null);

    const result = await service.createOrGet(templateId, opportunityId, accountId, 'frontend-id');

    expect(result.id).toBe('frontend-id');
    expect(result.defaultCustomFieldId).toBe(templateId);
    expect(result.toPrimitives()).toEqual(
      expect.objectContaining({
        name: template.name,
        classifiers: template.classifiers,
        automatic: true,
      }),
    );
    expect(ids.generate).not.toHaveBeenCalled();
    expect(instances.save).toHaveBeenCalledWith(result);
  });

  it('rejects templates that do not belong to the account', async () => {
    const { service, defaults } = createService(null);
    defaults.findById.mockResolvedValue(
      DefaultCustomField.create({
        id: templateId,
        accountId: 'another-account',
        name: 'Foreign field',
        type: 'TEXT',
      }),
    );

    await expect(service.createOrGet(templateId, opportunityId, accountId)).rejects.toThrow(
      DefaultCustomFieldNotFoundException,
    );
  });
});
