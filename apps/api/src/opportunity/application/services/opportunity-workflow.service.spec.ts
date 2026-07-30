/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import {
  DefaultWorkflowStepActionRepository,
  DefaultWorkflowStepAction,
  WorkflowRepository,
  WorkflowStep,
  WorkflowStepRepository,
} from '@/workflow';
import { Workflow } from '@/workflow/domain/workflow.entity';
import { IdService } from '@/shared/domain/services/id.service';
import { ControlQuestionFromDefaultService } from '@/control-question';
import { CustomFieldFromDefaultService } from '@/custom-field';
import { SummaryFromTemplateService } from '@/summary';
import { Opportunity } from '../../domain/opportunity.entity';
import { OpportunityRepository } from '../../domain/opportunity.repository';
import { OpportunityFinder } from './opportunity.finder';
import { WorkflowStepActionRepository } from '../../domain/workflow-step-action.repository';
import { WorkflowDecisionResultRepository } from '../../domain/workflow-decision-result.repository';
import { WorkflowDecisionResult } from '../../domain/workflow-decision-result.entity';
import { WorkflowStepAction } from '../../domain/workflow-step-action.entity';
import { OpportunityWorkflowConflictException } from '../../domain/exceptions/opportunity-workflow-conflict.exception';
import { WorkflowRuntimeActionNotFoundException } from '../../domain/exceptions/workflow-runtime-action-not-found.exception';
import { OpportunityWorkflowService } from './opportunity-workflow.service';
import {
  OpportunityStepActionsCreatedEvent,
  OpportunityQualificationGenerationRequestedEvent,
  OpportunityWorkflowStepEnteredEvent,
  WorkflowDecisionEvaluatedEvent,
} from '../events/opportunity-workflow.events';

describe('OpportunityWorkflowService', () => {
  let opportunity: Opportunity;
  const accountId = '019fa500-0000-7000-8000-000000000002';
  const opportunityId = '019fa500-0000-7000-8000-000000000001';
  const pipelineId = '019fa500-0000-7000-8000-000000000003';
  const pipelineStatusId = '019fa500-0000-7000-8000-000000000004';
  const workflowId = '019fa500-0000-7000-8000-000000000005';
  const decisionStepId = '019fa500-0000-7000-8000-000000000006';
  const nextStepId = '019fa500-0000-7000-8000-000000000007';

  const workflow = Workflow.create({
    id: workflowId,
    accountId,
    name: 'Qualification',
    description: 'Opportunity qualification',
  });
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

  function createOpportunity(assignWorkflow = true): Opportunity {
    const instance = Opportunity.create({
      id: opportunityId,
      accountId,
      title: 'Opportunity',
      pipelineId,
      pipelineStatusId,
      sortPoints: 1000,
    });
    if (assignWorkflow) instance.assignWorkflow(workflowId, decisionStepId);
    return instance;
  }

  beforeEach(() => {
    opportunity = createOpportunity();
  });

  function createService(defaultActions: DefaultWorkflowStepAction[] = []) {
    const opportunityRepo = {
      findById: jest.fn().mockResolvedValue(opportunity),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OpportunityRepository>;
    const workflowRepo = {
      findById: jest.fn().mockResolvedValue(workflow),
    } as unknown as jest.Mocked<WorkflowRepository>;
    const stepRepo = {
      findByWorkflowId: jest.fn().mockResolvedValue([decisionStep, nextStep]),
      findById: jest
        .fn()
        .mockImplementation((id: string) =>
          Promise.resolve([decisionStep, nextStep].find((step) => step.id === id) ?? null),
        ),
    } as unknown as jest.Mocked<WorkflowStepRepository>;
    const defaultActionRepo = {
      findByWorkflowStepIds: jest.fn().mockResolvedValue(defaultActions),
    } as unknown as jest.Mocked<DefaultWorkflowStepActionRepository>;
    const actionRepo = {
      findByOpportunityAndStep: jest.fn().mockResolvedValue([]),
      findByOpportunityId: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      saveMany: jest.fn().mockResolvedValue(undefined),
      deleteByOpportunityId: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WorkflowStepActionRepository>;
    const decision = WorkflowDecisionResult.create({
      id: '019fa500-0000-7000-8000-000000000008',
      accountId: opportunity.accountId,
      opportunityId: opportunity.id,
      workflowStepId: decisionStepId,
    });
    const decisionRepo = {
      findByOpportunityAndStep: jest.fn().mockResolvedValue(decision),
      findByOpportunityId: jest.fn().mockResolvedValue([decision]),
      save: jest.fn().mockResolvedValue(undefined),
      deleteByOpportunityId: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WorkflowDecisionResultRepository>;
    const idService = {
      generate: jest.fn().mockReturnValue('019fa500-0000-7000-8000-000000000009'),
    } as unknown as jest.Mocked<IdService>;
    const controlQuestionFromDefault = {
      createOrGet: jest.fn(),
    } as unknown as jest.Mocked<ControlQuestionFromDefaultService>;
    const customFieldFromDefault = {
      createOrGet: jest.fn(),
    } as unknown as jest.Mocked<CustomFieldFromDefaultService>;
    const summaryFromTemplate = {
      createOrGet: jest.fn(),
    } as unknown as jest.Mocked<SummaryFromTemplateService>;
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;

    return {
      service: new OpportunityWorkflowService(
        opportunityRepo,
        new OpportunityFinder(opportunityRepo),
        workflowRepo,
        stepRepo,
        defaultActionRepo,
        actionRepo,
        decisionRepo,
        controlQuestionFromDefault,
        customFieldFromDefault,
        summaryFromTemplate,
        idService,
        eventBus,
      ),
      opportunityRepo,
      workflowRepo,
      stepRepo,
      defaultActionRepo,
      actionRepo,
      decisionRepo,
      controlQuestionFromDefault,
      customFieldFromDefault,
      summaryFromTemplate,
      eventBus,
    };
  }

  function createAction(
    overrides: Partial<{
      id: string;
      workflowStepId: string;
      targetType: 'task' | 'attachment' | 'control_question' | 'custom_field' | 'summary' | 'opportunity_status_update';
      targetId: string | null;
      metadata: Record<string, unknown> | null;
    }> = {},
  ): WorkflowStepAction {
    return WorkflowStepAction.create({
      id: overrides.id ?? '019fa500-0000-7000-8000-000000000050',
      accountId,
      opportunityId,
      workflowStepId: overrides.workflowStepId ?? decisionStepId,
      defaultWorkflowStepActionId: '019fa500-0000-7000-8000-000000000051',
      name: 'Runtime action',
      targetType: overrides.targetType ?? 'task',
      targetId: overrides.targetId ?? null,
      metadata: overrides.metadata ?? null,
      position: 1,
    });
  }

  it('advances directly without creating actions when a decision is false', async () => {
    const { service, actionRepo, eventBus } = createService();

    await service.applyDecision(
      new WorkflowDecisionEvaluatedEvent(opportunity.id, opportunity.accountId, decisionStepId, 'FALSE', 'No'),
    );

    expect(actionRepo.saveMany).not.toHaveBeenCalled();
    expect(opportunity.workflowStepId).toBe(nextStepId);

    expect(eventBus.publishAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(OpportunityWorkflowStepEnteredEvent)]),
    );
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

    expect(actionRepo.saveMany).toHaveBeenCalledWith([expect.objectContaining({ workflowStepId: decisionStepId })]);

    expect(eventBus.publishAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(OpportunityStepActionsCreatedEvent)]),
    );
  });

  it('completes a pending qualification action when its instance is updated', async () => {
    opportunity.assignWorkflow(workflowId, decisionStepId);
    const action = WorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000020',
      accountId: opportunity.accountId,
      opportunityId: opportunity.id,
      workflowStepId: decisionStepId,
      defaultWorkflowStepActionId: '019fa500-0000-7000-8000-000000000021',
      name: 'Answer control question',
      targetType: 'control_question',
      targetId: '019fa500-0000-7000-8000-000000000022',
      metadata: null,
      position: 1,
    });
    const { service, actionRepo, eventBus } = createService();
    actionRepo.findByOpportunityAndStep.mockResolvedValue([action]);
    actionRepo.save = jest.fn().mockResolvedValue(undefined);

    await service.completeQualificationActions(
      opportunity.id,
      opportunity.accountId,
      'control_question',
      '019fa500-0000-7000-8000-000000000022',
    );

    expect(action.status).toBe('COMPLETED');

    expect(actionRepo.saveMany).toHaveBeenCalledWith([action]);

    expect(eventBus.publishAll).toHaveBeenCalled();
  });

  it('completes a failed qualification action when its instance succeeds after a direct retry', async () => {
    opportunity.assignWorkflow(workflowId, decisionStepId);
    const action = WorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000023',
      accountId: opportunity.accountId,
      opportunityId: opportunity.id,
      workflowStepId: decisionStepId,
      defaultWorkflowStepActionId: '019fa500-0000-7000-8000-000000000024',
      name: 'Generate summary',
      targetType: 'summary',
      targetId: '019fa500-0000-7000-8000-000000000025',
      metadata: null,
      position: 1,
    });
    action.fail('Provider unavailable');
    const { service, actionRepo, eventBus } = createService();
    actionRepo.findByOpportunityAndStep.mockResolvedValue([action]);

    await service.completeQualificationActions(
      opportunity.id,
      opportunity.accountId,
      'summary',
      '019fa500-0000-7000-8000-000000000025',
    );

    expect(action.status).toBe('COMPLETED');
    expect(actionRepo.saveMany).toHaveBeenCalledWith([action]);
    expect(eventBus.publishAll).toHaveBeenCalled();
  });

  it('links a workflow action to the existing qualification instance', async () => {
    const defaultAction = DefaultWorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000030',
      workflowStepId: decisionStepId,
      name: 'Answer control question',
      targetType: 'control_question',
      targetId: '019fa500-0000-7000-8000-000000000031',
      position: 1,
    });
    const { service, actionRepo, controlQuestionFromDefault } = createService([defaultAction]);
    controlQuestionFromDefault.createOrGet.mockResolvedValue({
      id: '019fa500-0000-7000-8000-000000000032',
    } as never);

    await service.createCurrentStepActions(opportunity.id, opportunity.accountId, decisionStepId);

    expect(controlQuestionFromDefault.createOrGet).toHaveBeenCalledWith(
      defaultAction.targetId,
      opportunity.id,
      opportunity.accountId,
    );

    expect(actionRepo.saveMany).toHaveBeenCalledWith([
      expect.objectContaining({ targetId: '019fa500-0000-7000-8000-000000000032' }),
    ]);
  });

  it('creates an unlinked qualification action when the definition has no template', async () => {
    const defaultAction = DefaultWorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000040',
      workflowStepId: decisionStepId,
      name: 'Unconfigured summary',
      targetType: 'summary',
      position: 1,
    });
    const { service, actionRepo } = createService([defaultAction]);

    await service.createCurrentStepActions(opportunity.id, opportunity.accountId, decisionStepId);

    expect(actionRepo.saveMany).toHaveBeenCalledWith([expect.objectContaining({ targetId: null })]);
  });

  it('assigns a workflow, precreates its runtime actions and enters the first step', async () => {
    opportunity = createOpportunity(false);
    const defaultAction = DefaultWorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000060',
      workflowStepId: nextStepId,
      name: 'Prepare next step',
      targetType: 'task',
      position: 1,
    });
    const { service, opportunityRepo, actionRepo, eventBus } = createService([defaultAction]);

    await service.assign(opportunityId, accountId, workflowId, false);

    expect(opportunity.workflowId).toBe(workflowId);
    expect(opportunity.workflowStepId).toBe(decisionStepId);
    expect(opportunityRepo.save).toHaveBeenCalledWith(opportunity);
    expect(actionRepo.saveMany).toHaveBeenCalledWith([expect.objectContaining({ workflowStepId: nextStepId })]);
    expect(eventBus.publishAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(OpportunityWorkflowStepEnteredEvent)]),
    );
  });

  it('rejects assigning another workflow unless replacement is requested', async () => {
    const { service } = createService();

    await expect(service.assign(opportunityId, accountId, workflowId, false)).rejects.toThrow(
      OpportunityWorkflowConflictException,
    );
  });

  it('rejects replacing a workflow while an action is in progress', async () => {
    const action = createAction();
    action.start();
    const { service, actionRepo } = createService();
    actionRepo.findByOpportunityId.mockResolvedValue([action]);

    await expect(service.assign(opportunityId, accountId, workflowId, true)).rejects.toThrow(
      'No se puede cambiar el workflow con acciones en progreso',
    );
  });

  it('clears the previous runtime before replacing a workflow', async () => {
    const { service, actionRepo, decisionRepo } = createService();

    await service.assign(opportunityId, accountId, workflowId, true);

    expect(actionRepo.deleteByOpportunityId).toHaveBeenCalledWith(opportunityId);
    expect(decisionRepo.deleteByOpportunityId).toHaveBeenCalledWith(opportunityId);
  });

  it('initializes a decision step and requests its evaluation', async () => {
    const { service, decisionRepo, eventBus } = createService();
    decisionRepo.findByOpportunityAndStep.mockResolvedValue(null);

    await service.initializeCurrentStep(opportunityId, accountId, decisionStepId);

    expect(decisionRepo.save).toHaveBeenCalledWith(expect.objectContaining({ workflowStepId: decisionStepId }));
    expect(eventBus.publishAll).toHaveBeenCalledWith(expect.anything());
  });

  it('initializes a normal current step by creating its actions', async () => {
    opportunity.advanceWorkflowStep(nextStepId);
    const defaultAction = DefaultWorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000061',
      workflowStepId: nextStepId,
      name: 'Manual action',
      targetType: 'task',
      position: 1,
    });
    const { service, actionRepo } = createService([defaultAction]);

    await service.initializeCurrentStep(opportunityId, accountId, nextStepId);

    expect(actionRepo.saveMany).toHaveBeenCalled();
  });

  it('does not initialize a step that is not current', async () => {
    const { service, actionRepo, decisionRepo, eventBus } = createService();

    await service.initializeCurrentStep(opportunityId, accountId, nextStepId);

    expect(actionRepo.saveMany).not.toHaveBeenCalled();
    expect(decisionRepo.save).not.toHaveBeenCalled();
    expect(eventBus.publishAll).not.toHaveBeenCalled();
  });

  it('does not duplicate actions already linked to their workflow defaults', async () => {
    const defaultAction = DefaultWorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000062',
      workflowStepId: decisionStepId,
      name: 'Existing action',
      targetType: 'task',
      position: 1,
    });
    const existing = WorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000063',
      accountId,
      opportunityId,
      workflowStepId: decisionStepId,
      defaultWorkflowStepActionId: defaultAction.id,
      name: defaultAction.name,
      targetType: defaultAction.targetType,
      targetId: null,
      metadata: null,
      position: 1,
    });
    const { service, actionRepo } = createService([defaultAction]);
    actionRepo.findByOpportunityId.mockResolvedValue([existing]);

    await service.createCurrentStepActions(opportunityId, accountId, decisionStepId);

    expect(actionRepo.saveMany).not.toHaveBeenCalled();
  });

  it('resolves custom-field and summary template targets to their existing instances', async () => {
    const customAction = DefaultWorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000064',
      workflowStepId: decisionStepId,
      name: 'Fill field',
      targetType: 'custom_field',
      targetId: '019fa500-0000-7000-8000-000000000065',
      position: 1,
    });
    const summaryAction = DefaultWorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000066',
      workflowStepId: decisionStepId,
      name: 'Generate summary',
      targetType: 'summary',
      targetId: '019fa500-0000-7000-8000-000000000067',
      position: 2,
    });
    const { service, actionRepo, customFieldFromDefault, summaryFromTemplate } = createService([
      customAction,
      summaryAction,
    ]);
    customFieldFromDefault.createOrGet.mockResolvedValue({ id: 'custom-instance' } as never);
    summaryFromTemplate.createOrGet.mockResolvedValue({ id: 'summary-instance' } as never);

    await service.createCurrentStepActions(opportunityId, accountId, decisionStepId);

    expect(actionRepo.saveMany).toHaveBeenCalledWith([
      expect.objectContaining({ targetId: 'custom-instance' }),
      expect.objectContaining({ targetId: 'summary-instance' }),
    ]);
  });

  it('completes and skips current pending actions', async () => {
    const completeAction = createAction({ id: 'complete-action' });
    const skipAction = createAction({ id: 'skip-action', targetType: 'attachment' });
    const { service, actionRepo, eventBus } = createService();
    actionRepo.findById.mockResolvedValueOnce(completeAction).mockResolvedValueOnce(skipAction);

    await service.completeAction(opportunityId, accountId, completeAction.id);
    await service.skipAction(opportunityId, accountId, skipAction.id);

    expect(completeAction.status).toBe('COMPLETED');
    expect(skipAction.status).toBe('SKIPPED');
    expect(actionRepo.save).toHaveBeenCalledTimes(2);
    expect(eventBus.publishAll).toHaveBeenCalledTimes(2);
  });

  it('allows skipping a failed action instead of forcing another retry', async () => {
    const action = createAction({ id: 'failed-action-to-skip', targetType: 'summary' });
    action.fail('Provider unavailable');
    const { service, actionRepo } = createService();
    actionRepo.findById.mockResolvedValue(action);

    await service.skipAction(opportunityId, accountId, action.id);

    expect(action.status).toBe('SKIPPED');
    expect(actionRepo.save).toHaveBeenCalledWith(action);
  });

  it('rejects completing or skipping an action in progress', async () => {
    const action = createAction();
    action.start();
    const { service, actionRepo } = createService();
    actionRepo.findById.mockResolvedValue(action);

    await expect(service.completeAction(opportunityId, accountId, action.id)).rejects.toThrow(
      OpportunityWorkflowConflictException,
    );
    await expect(service.skipAction(opportunityId, accountId, action.id)).rejects.toThrow(
      OpportunityWorkflowConflictException,
    );
  });

  it('rejects mutating an action outside the current workflow step', async () => {
    const action = createAction({ workflowStepId: nextStepId });
    const { service, actionRepo } = createService();
    actionRepo.findById.mockResolvedValue(action);

    await expect(service.completeAction(opportunityId, accountId, action.id)).rejects.toThrow(
      WorkflowRuntimeActionNotFoundException,
    );
  });

  it('retries failed actions and rejects retrying other statuses', async () => {
    const failed = createAction({ id: 'failed-action' });
    failed.fail('Network error');
    const pending = createAction({ id: 'pending-action' });
    const { service, actionRepo } = createService();
    actionRepo.findById.mockResolvedValueOnce(failed).mockResolvedValueOnce(pending);

    await service.retryAction(opportunityId, accountId, failed.id);
    await expect(service.retryAction(opportunityId, accountId, pending.id)).rejects.toThrow(
      OpportunityWorkflowConflictException,
    );

    expect(failed.status).toBe('PENDING');
  });

  it('auto-executes an opportunity status transition', async () => {
    const action = createAction({
      targetType: 'opportunity_status_update',
      targetId: '019fa500-0000-7000-8000-000000000070',
      metadata: { pipelineId: '019fa500-0000-7000-8000-000000000071' },
    });
    const { service, actionRepo, opportunityRepo } = createService();
    actionRepo.findByOpportunityAndStep.mockResolvedValue([action]);

    await service.autoExecute(opportunityId, accountId);

    expect(action.status).toBe('COMPLETED');
    expect(opportunity.pipelineId).toBe('019fa500-0000-7000-8000-000000000071');
    expect(opportunity.pipelineStatusId).toBe('019fa500-0000-7000-8000-000000000070');
    expect(opportunityRepo.save).toHaveBeenCalledWith(opportunity);
  });

  it('starts qualification actions and requests their AI generation through Nest events', async () => {
    const action = createAction({
      targetType: 'summary',
      targetId: '019fa500-0000-7000-8000-000000000072',
    });
    const { service, actionRepo, eventBus } = createService();
    actionRepo.findByOpportunityAndStep.mockResolvedValue([action]);

    await service.autoExecute(opportunityId, accountId);

    expect(action.status).toBe('IN_PROGRESS');
    expect(eventBus.publishAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(OpportunityQualificationGenerationRequestedEvent)]),
    );
  });

  it('marks an invalid automatic status transition as failed', async () => {
    const action = createAction({ targetType: 'opportunity_status_update' });
    const { service, actionRepo } = createService();
    actionRepo.findByOpportunityAndStep.mockResolvedValue([action]);

    await service.autoExecute(opportunityId, accountId);

    expect(action.status).toBe('FAILED');
    expect(action.toPrimitives().errorMessage).toBe('La acción no tiene estado destino');
  });

  it('advances a settled normal step and stops while actions remain pending', async () => {
    opportunity.advanceWorkflowStep(nextStepId);
    const completed = createAction({ workflowStepId: nextStepId });
    completed.complete();
    const { service, actionRepo, eventBus } = createService();
    actionRepo.findByOpportunityAndStep.mockResolvedValue([completed]);

    await service.checkAndAdvance(opportunityId, accountId);

    expect(eventBus.publishAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ opportunityId })]),
    );

    const pending = createAction({ workflowStepId: nextStepId });
    eventBus.publishAll.mockClear();
    actionRepo.findByOpportunityAndStep.mockResolvedValue([pending]);
    await service.checkAndAdvance(opportunityId, accountId);
    expect(eventBus.publishAll).not.toHaveBeenCalled();
  });

  it('does not advance a decision until it evaluates true', async () => {
    const { service, decisionRepo, eventBus } = createService();
    decisionRepo.findByOpportunityAndStep.mockResolvedValue(
      WorkflowDecisionResult.create({
        id: 'pending-decision',
        accountId,
        opportunityId,
        workflowStepId: decisionStepId,
      }),
    );

    await service.checkAndAdvance(opportunityId, accountId);

    expect(eventBus.publishAll).not.toHaveBeenCalled();
  });

  it('advances to the next step and publishes completion at the end', async () => {
    const { service, eventBus } = createService();

    await service.advance(opportunityId, accountId);
    expect(opportunity.workflowStepId).toBe(nextStepId);
    expect(eventBus.publishAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(OpportunityWorkflowStepEnteredEvent)]),
    );

    eventBus.publishAll.mockClear();
    await service.advance(opportunityId, accountId);
    expect(eventBus.publishAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ opportunityId })]),
    );
  });

  it('requests a new decision evaluation and resets an existing result', async () => {
    const { service, decisionRepo, eventBus } = createService();
    decisionRepo.findByOpportunityAndStep.mockResolvedValueOnce(null);
    await service.requestDecisionEvaluation(opportunityId, accountId, decisionStepId);

    const existing = WorkflowDecisionResult.create({
      id: 'existing-decision',
      accountId,
      opportunityId,
      workflowStepId: decisionStepId,
    });
    existing.resolve('FALSE', 'Old evidence');
    decisionRepo.findByOpportunityAndStep.mockResolvedValueOnce(existing);
    await service.requestDecisionEvaluation(opportunityId, accountId, decisionStepId);

    expect(existing.status).toBe('PENDING');
    expect(decisionRepo.save).toHaveBeenCalledTimes(2);
    expect(eventBus.publishAll).toHaveBeenCalledTimes(2);
  });

  it('rejects reevaluation for another step or while an action is in progress', async () => {
    const { service, actionRepo } = createService();
    await expect(service.requestDecisionEvaluation(opportunityId, accountId, nextStepId)).rejects.toThrow(
      'Solo se puede reevaluar la decisión actual',
    );

    const action = createAction();
    action.start();
    actionRepo.findByOpportunityAndStep.mockResolvedValue([action]);
    await expect(service.requestDecisionEvaluation(opportunityId, accountId, decisionStepId)).rejects.toThrow(
      'No se puede reevaluar con acciones en progreso',
    );
  });

  it('ignores a decision result for a step that is no longer current', async () => {
    const { service, decisionRepo } = createService();

    await service.applyDecision(new WorkflowDecisionEvaluatedEvent(opportunityId, accountId, nextStepId, 'TRUE', null));

    expect(decisionRepo.save).not.toHaveBeenCalled();
  });

  it('returns the complete workflow runtime DTO', async () => {
    const defaultAction = DefaultWorkflowStepAction.create({
      id: 'dto-default',
      workflowStepId: decisionStepId,
      name: 'DTO action',
      targetType: 'task',
      position: 1,
    });
    const action = createAction();
    action.complete();
    const decision = WorkflowDecisionResult.create({
      id: 'dto-decision',
      accountId,
      opportunityId,
      workflowStepId: decisionStepId,
    });
    decision.resolve('TRUE', 'Qualified');
    const { service, actionRepo, decisionRepo } = createService([defaultAction]);
    actionRepo.findByOpportunityId.mockResolvedValue([action]);
    decisionRepo.findByOpportunityId.mockResolvedValue([decision]);

    const result = await service.find(opportunityId, accountId);

    expect(result.workflow.id).toBe(workflowId);
    expect(result.workflow.steps).toHaveLength(2);
    expect(result.actions[0]).toEqual(expect.objectContaining({ status: 'COMPLETED' }));
    expect(result.decisions[0]).toEqual(expect.objectContaining({ status: 'TRUE', evidence: 'Qualified' }));
    expect(result.status).toBe('ACTIVE');
  });

  it('rejects finding runtime data without a valid assigned workflow', async () => {
    opportunity = createOpportunity(false);
    const { service } = createService();
    await expect(service.find(opportunityId, accountId)).rejects.toThrow('La oportunidad no tiene workflow asignado');

    opportunity.assignWorkflow(workflowId, decisionStepId);
    const invalid = createService();
    invalid.workflowRepo.findById.mockResolvedValue(null);
    await expect(invalid.service.find(opportunityId, accountId)).rejects.toThrow('El workflow asignado no existe');
  });
});
