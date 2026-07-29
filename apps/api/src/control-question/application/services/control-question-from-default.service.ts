import { Injectable } from '@nestjs/common';
import { IdService } from '@/shared/domain/services/id.service';
import { ControlQuestion } from '../../domain/control-question.entity';
import { ControlQuestionRepository } from '../../domain/control-question.repository';
import { DefaultControlQuestionRepository } from '../../domain/default-control-question.repository';
import { DefaultControlQuestionNotFoundException } from '../../domain/exceptions/default-control-question-not-found.exception';

@Injectable()
export class ControlQuestionFromDefaultService {
  constructor(
    private readonly defaults: DefaultControlQuestionRepository,
    private readonly instances: ControlQuestionRepository,
    private readonly ids: IdService,
  ) {}

  async createOrGet(
    defaultControlQuestionId: string,
    opportunityId: string,
    accountId: string,
    instanceId?: string,
  ): Promise<ControlQuestion> {
    const [template, existing] = await Promise.all([
      this.defaults.findById(defaultControlQuestionId),
      this.instances.findByOpportunityAndDefaultId(opportunityId, defaultControlQuestionId),
    ]);
    if (!template || template.accountId !== accountId) {
      throw new DefaultControlQuestionNotFoundException(defaultControlQuestionId);
    }
    if (existing) return existing;

    const instance = ControlQuestion.create({
      id: instanceId ?? this.ids.generate(),
      accountId,
      opportunityId,
      defaultControlQuestionId,
      question: template.question,
      answerType: template.answerType,
      passConditionPrompt: template.passConditionPrompt,
    });
    await this.instances.save(instance);
    return instance;
  }
}
