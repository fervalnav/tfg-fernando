import { EventBus } from '@nestjs/cqrs';
import {
  DefaultWorkflowStepActionRepository,
  DefaultWorkflowStepAction,
  WorkflowRepository,
  WorkflowStep,
  WorkflowStepRepository,
} from '@/workflow';
import { IdService } from '@/shared/domain/services/id.service';
import { Opportunity } from '../../domain/opportunity.entity';
import { OpportunityRepository } from '../../domain/opportunity.repository';
import { WorkflowStepActionRepository } from '../../domain/workflow-step-action.repository';
import { WorkflowDecisionResultRepository } from '../../domain/workflow-decision-result.repository';
import { WorkflowDecisionResult } from '../../domain/workflow-decision-result.entity';
import { OpportunityWorkflowService } from './opportunity-workflow.service';
import {
  OpportunityStepActionsCreatedEvent,
  OpportunityWorkflowStepEnteredEvent,
  WorkflowDecisionEvaluatedEvent,
} from './opportunity-workflow.events';

describe('OpportunityWorkflowService decisions', () => {
  const opportunity = Opportunity.create({
    id: '019fa500-0000-7000-8000-000000000001',
    accountId: '019fa500-0000-7000-8000-000000000002',
    title: 'Opportunity',
    pipelineId: '019fa500-0000-7000-8000-000000000003',
    pipelineStatusId: '019fa500-0000-7000-8000-000000000004',
    sortPoints: 1000,
  });
  const workflowId = '019fa500-0000-7000-8000-000000000005';
  const decisionStepId = '019fa500-0000-7000-8000-000000000006';
  const nextStepId = '019fa500-0000-7000-8000-000000000007';
  opportunity.assignWorkflow(workflowId, decisionStepId);

  const decisionStep = WorkflowStep.create({
    id: decisionStepId,
    workflowId,
    name: 'Decision',
    type: 'decision',
    condition: 'Condition',
    position: 1,
  });
  const nextStep = WorkflowStep.create({
    id: nextStepId,
    workflowId,
    name: 'Next',
    type: 'step',
    position: 2,
  });

  function createService(defaultActions: DefaultWorkflowStepAction[] = []) {
    const opportunityRepo = {
      findById: jest.fn().mockResolvedValue(opportunity),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OpportunityRepository>;
    const workflowRepo = {} as jest.Mocked<WorkflowRepository>;
    const stepRepo = {
      findByWorkflowId: jest.fn().mockResolvedValue([decisionStep, nextStep]),
    } as unknown as jest.Mocked<WorkflowStepRepository>;
    const defaultActionRepo = {
      findByWorkflowStepIds: jest.fn().mockResolvedValue(defaultActions),
    } as unknown as jest.Mocked<DefaultWorkflowStepActionRepository>;
    const actionRepo = {
      findByOpportunityAndStep: jest.fn().mockResolvedValue([]),
      saveMany: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WorkflowStepActionRepository>;
    const decision = WorkflowDecisionResult.create({
      id: '019fa500-0000-7000-8000-000000000008',
      accountId: opportunity.accountId,
      opportunityId: opportunity.id,
      workflowStepId: decisionStepId,
    });
    const decisionRepo = {
      findByOpportunityAndStep: jest.fn().mockResolvedValue(decision),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WorkflowDecisionResultRepository>;
    const idService = {
      generate: jest.fn().mockReturnValue('019fa500-0000-7000-8000-000000000009'),
    } as unknown as jest.Mocked<IdService>;
    const eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;

    return {
      service: new OpportunityWorkflowService(
        opportunityRepo,
        workflowRepo,
        stepRepo,
        defaultActionRepo,
        actionRepo,
        decisionRepo,
        idService,
        eventBus,
      ),
      actionRepo,
      eventBus,
    };
  }

  it('advances directly without creating actions when a decision is false', async () => {
    const { service, actionRepo, eventBus } = createService();

    await service.applyDecision(
      new WorkflowDecisionEvaluatedEvent(opportunity.id, opportunity.accountId, decisionStepId, 'FALSE', 'No'),
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(actionRepo.saveMany).not.toHaveBeenCalled();
    expect(opportunity.workflowStepId).toBe(nextStepId);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(OpportunityWorkflowStepEnteredEvent));
  });

  it('creates the decision actions when a decision is true', async () => {
    opportunity.assignWorkflow(workflowId, decisionStepId);
    const defaultAction = DefaultWorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000010',
      workflowStepId: decisionStepId,
      name: 'Decision action',
      targetType: 'task',
      position: 1,
    });
    const { service, actionRepo, eventBus } = createService([defaultAction]);

    await service.applyDecision(
      new WorkflowDecisionEvaluatedEvent(opportunity.id, opportunity.accountId, decisionStepId, 'TRUE', 'Yes'),
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(actionRepo.saveMany).toHaveBeenCalledWith([expect.objectContaining({ workflowStepId: decisionStepId })]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(OpportunityStepActionsCreatedEvent));
  });
});
