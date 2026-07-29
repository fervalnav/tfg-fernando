import { IdService } from '@/shared/domain/services/id.service';
import { ControlQuestion } from '../../domain/control-question.entity';
import { ControlQuestionRepository } from '../../domain/control-question.repository';
import { DefaultControlQuestion } from '../../domain/default-control-question.entity';
import { DefaultControlQuestionRepository } from '../../domain/default-control-question.repository';
import { ControlQuestionFromDefaultService } from './control-question-from-default.service';

describe('ControlQuestionFromDefaultService', () => {
  const accountId = '019fa700-0000-7000-8000-000000000001';
  const opportunityId = '019fa700-0000-7000-8000-000000000002';
  const templateId = '019fa700-0000-7000-8000-000000000003';
  const instanceId = '019fa700-0000-7000-8000-000000000004';
  const generatedId = '019fa700-0000-7000-8000-000000000005';
  const template = DefaultControlQuestion.create({
    id: templateId,
    accountId,
    question: '¿Cumple los requisitos?',
    answerType: 'BOOLEAN',
  });

  function createService(existing: ControlQuestion | null) {
    const defaults = {
      findById: jest.fn().mockResolvedValue(template),
    } as unknown as jest.Mocked<DefaultControlQuestionRepository>;
    const instances = {
      findByOpportunityAndDefaultId: jest.fn().mockResolvedValue(existing),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ControlQuestionRepository>;
    const ids = {
      generate: jest.fn().mockReturnValue(generatedId),
    } as unknown as jest.Mocked<IdService>;

    return {
      service: new ControlQuestionFromDefaultService(defaults, instances, ids),
      instances,
      ids,
    };
  }

  it('returns the existing instance without creating another one', async () => {
    const existing = ControlQuestion.create({
      id: instanceId,
      accountId,
      opportunityId,
      defaultControlQuestionId: templateId,
      question: template.question,
      answerType: template.answerType,
      passConditionPrompt: template.passConditionPrompt,
    });
    const { service, instances, ids } = createService(existing);

    const result = await service.createOrGet(templateId, opportunityId, accountId);

    expect(result).toBe(existing);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(instances.save).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ids.generate).not.toHaveBeenCalled();
  });

  it('creates and persists an instance when it does not exist', async () => {
    const { service, instances, ids } = createService(null);

    const result = await service.createOrGet(templateId, opportunityId, accountId);

    expect(result.id).toBe(generatedId);
    expect(result.defaultControlQuestionId).toBe(templateId);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ids.generate).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(instances.save).toHaveBeenCalledWith(result);
  });
});
