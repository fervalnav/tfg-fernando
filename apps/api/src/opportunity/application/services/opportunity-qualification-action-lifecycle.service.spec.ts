/* eslint-disable @typescript-eslint/unbound-method */
import { Opportunity } from '../../domain/opportunity.entity';
import { WorkflowStepAction } from '../../domain/workflow-step-action.entity';
import { WorkflowStepActionRepository } from '../../domain/workflow-step-action.repository';
import { OpportunityFinder } from './opportunity.finder';
import { OpportunityQualificationActionLifecycleService } from './opportunity-qualification-action-lifecycle.service';

describe('OpportunityQualificationActionLifecycleService', () => {
  const opportunityId = '019fa500-0000-7000-8000-000000000101';
  const accountId = '019fa500-0000-7000-8000-000000000102';
  const workflowId = '019fa500-0000-7000-8000-000000000103';
  const currentStepId = '019fa500-0000-7000-8000-000000000104';
  const targetId = '019fa500-0000-7000-8000-000000000105';

  function createAction(id: string, targetType: 'summary' | 'custom_field' = 'summary'): WorkflowStepAction {
    return WorkflowStepAction.create({
      id,
      accountId,
      opportunityId,
      workflowStepId: currentStepId,
      defaultWorkflowStepActionId: `${id}-default`,
      name: 'Generate qualification',
      targetType,
      targetId,
      metadata: null,
      position: 1,
    });
  }

  function createService(actions: WorkflowStepAction[]) {
    const opportunity = Opportunity.create({
      id: opportunityId,
      accountId,
      title: 'Opportunity',
      pipelineId: '019fa500-0000-7000-8000-000000000106',
      pipelineStatusId: '019fa500-0000-7000-8000-000000000107',
      sortPoints: 1000,
    });
    opportunity.assignWorkflow(workflowId, currentStepId);
    const finder = {
      find: jest.fn().mockResolvedValue(opportunity),
    } as unknown as jest.Mocked<OpportunityFinder>;
    const repository = {
      findByOpportunityAndStep: jest.fn().mockResolvedValue(actions),
      saveMany: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WorkflowStepActionRepository>;

    return {
      service: new OpportunityQualificationActionLifecycleService(finder, repository),
      repository,
    };
  }

  it('moves a failed linked action back to in progress before retrying AI generation', async () => {
    const action = createAction('019fa500-0000-7000-8000-000000000108');
    action.fail('Provider unavailable');
    const { service, repository } = createService([action]);

    await service.start(opportunityId, accountId, 'summary', targetId);

    expect(action.status).toBe('IN_PROGRESS');
    expect(action.toPrimitives().errorMessage).toBeNull();
    expect(repository.saveMany).toHaveBeenCalledWith([action]);
  });

  it('does not alter actions linked to another qualification target', async () => {
    const action = createAction('019fa500-0000-7000-8000-000000000109', 'custom_field');
    action.fail('Provider unavailable');
    const { service, repository } = createService([action]);

    await service.start(opportunityId, accountId, 'summary', targetId);

    expect(action.status).toBe('FAILED');
    expect(repository.saveMany).not.toHaveBeenCalled();
  });
});
