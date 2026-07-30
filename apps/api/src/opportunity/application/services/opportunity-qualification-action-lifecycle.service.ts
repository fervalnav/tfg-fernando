import { Injectable } from '@nestjs/common';
import type { ActionTargetType } from '@tfg/types';
import { WorkflowStepActionRepository } from '../../domain/workflow-step-action.repository';
import { OpportunityFinder } from './opportunity.finder';

type QualificationTargetType = Extract<ActionTargetType, 'control_question' | 'custom_field' | 'summary'>;

@Injectable()
export class OpportunityQualificationActionLifecycleService {
  constructor(
    private readonly opportunityFinder: OpportunityFinder,
    private readonly actionRepository: WorkflowStepActionRepository,
  ) {}

  async start(
    opportunityId: string,
    accountId: string,
    targetType: QualificationTargetType,
    targetId: string,
  ): Promise<void> {
    const opportunity = await this.opportunityFinder.find(opportunityId, accountId);
    if (!opportunity.workflowStepId) return;

    const actions = await this.actionRepository.findByOpportunityAndStep(opportunityId, opportunity.workflowStepId);
    const matchingActions = actions.filter(
      (action) =>
        action.targetType === targetType &&
        action.targetId === targetId &&
        (action.status === 'PENDING' || action.status === 'FAILED'),
    );

    for (const action of matchingActions) {
      action.retry(false);
      action.start();
    }
    if (matchingActions.length) await this.actionRepository.saveMany(matchingActions);
  }
}
