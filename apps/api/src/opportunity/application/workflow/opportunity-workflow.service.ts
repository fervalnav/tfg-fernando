import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import type { OpportunityWorkflowDto } from '@tfg/types';
import { DefaultWorkflowStepActionRepository, WorkflowRepository, WorkflowStepRepository } from '@/workflow';
import { IdService } from '@/shared/domain/services/id.service';
import { OpportunityRepository } from '../../domain/opportunity.repository';
import { WorkflowStepActionRepository } from '../../domain/workflow-step-action.repository';
import { WorkflowDecisionResultRepository } from '../../domain/workflow-decision-result.repository';
import { WorkflowStepAction } from '../../domain/workflow-step-action.entity';
import { WorkflowDecisionResult } from '../../domain/workflow-decision-result.entity';
import { OpportunityNotFoundException } from '../../domain/exceptions/opportunity-not-found.exception';
import { OpportunityWorkflowConflictException } from '../../domain/exceptions/opportunity-workflow-conflict.exception';
import { WorkflowRuntimeActionNotFoundException } from '../../domain/exceptions/workflow-runtime-action-not-found.exception';
import {
  OpportunityStepActionsCreatedEvent,
  OpportunityWorkflowCompletedEvent,
  OpportunityWorkflowStepEnteredEvent,
  WorkflowDecisionEvaluatedEvent,
  WorkflowDecisionEvaluationRequestedEvent,
  WorkflowStepActionStatusChangedEvent,
} from './opportunity-workflow.events';

@Injectable()
export class OpportunityWorkflowService {
  constructor(
    private readonly opportunityRepo: OpportunityRepository,
    private readonly workflowRepo: WorkflowRepository,
    private readonly stepRepo: WorkflowStepRepository,
    private readonly defaultActionRepo: DefaultWorkflowStepActionRepository,
    private readonly actionRepo: WorkflowStepActionRepository,
    private readonly decisionRepo: WorkflowDecisionResultRepository,
    private readonly idService: IdService,
    private readonly eventBus: EventBus,
  ) {}

  async assign(opportunityId: string, accountId: string, workflowId: string, replace: boolean): Promise<void> {
    const [opportunity, workflow, steps] = await Promise.all([
      this.getOpportunity(opportunityId, accountId),
      this.workflowRepo.findById(workflowId),
      this.stepRepo.findByWorkflowId(workflowId),
    ]);
    if (!workflow || workflow.accountId !== accountId) {
      throw new OpportunityWorkflowConflictException('El workflow no existe en esta cuenta');
    }
    const firstStep = [...steps].sort((a, b) => a.position - b.position)[0];
    if (!firstStep) throw new OpportunityWorkflowConflictException('El workflow no tiene pasos');
    if (opportunity.workflowId && !replace) {
      throw new OpportunityWorkflowConflictException('La oportunidad ya tiene un workflow');
    }
    if (replace) {
      const currentActions = await this.actionRepo.findByOpportunityId(opportunityId, accountId);
      if (currentActions.some((action) => action.status === 'IN_PROGRESS')) {
        throw new OpportunityWorkflowConflictException('No se puede cambiar el workflow con acciones en progreso');
      }
      await Promise.all([
        this.actionRepo.deleteByOpportunityId(opportunityId),
        this.decisionRepo.deleteByOpportunityId(opportunityId),
      ]);
    }
    opportunity.assignWorkflow(workflowId, firstStep.id);
    await this.opportunityRepo.save(opportunity);
    this.eventBus.publish(new OpportunityWorkflowStepEnteredEvent(opportunityId, accountId, firstStep.id));
  }

  async initializeCurrentStep(opportunityId: string, accountId: string, workflowStepId: string): Promise<void> {
    const [opportunity, step] = await Promise.all([
      this.getOpportunity(opportunityId, accountId),
      this.stepRepo.findById(workflowStepId),
    ]);
    if (!step || opportunity.workflowId !== step.workflowId || opportunity.workflowStepId !== step.id) return;

    if (step.type === 'decision') {
      let result = await this.decisionRepo.findByOpportunityAndStep(opportunityId, step.id);
      if (!result) {
        result = WorkflowDecisionResult.create({
          id: this.idService.generate(),
          accountId,
          opportunityId,
          workflowStepId: step.id,
        });
        await this.decisionRepo.save(result);
      }
      this.eventBus.publish(new WorkflowDecisionEvaluationRequestedEvent(opportunityId, accountId, step.id));
      return;
    }

    await this.createCurrentStepActions(opportunityId, accountId, step.id);
  }

  async createCurrentStepActions(opportunityId: string, accountId: string, workflowStepId: string): Promise<void> {
    const [defaults, existing] = await Promise.all([
      this.defaultActionRepo.findByWorkflowStepIds([workflowStepId]),
      this.actionRepo.findByOpportunityAndStep(opportunityId, workflowStepId),
    ]);
    const existingDefaultIds = new Set(existing.map((action) => action.toPrimitives().defaultWorkflowStepActionId));
    const actions = defaults
      .filter((action) => !existingDefaultIds.has(action.id))
      .map((action) =>
        WorkflowStepAction.create({
          id: this.idService.generate(),
          accountId,
          opportunityId,
          workflowStepId,
          defaultWorkflowStepActionId: action.id,
          name: action.name,
          targetType: action.targetType,
          targetId: action.targetId,
          metadata: action.metadata,
          position: action.position,
        }),
      );
    if (actions.length) await this.actionRepo.saveMany(actions);
    this.eventBus.publish(new OpportunityStepActionsCreatedEvent(opportunityId, accountId));
  }

  async completeAction(opportunityId: string, accountId: string, actionId: string): Promise<void> {
    const action = await this.getCurrentAction(opportunityId, accountId, actionId);
    if (action.status === 'IN_PROGRESS') {
      throw new OpportunityWorkflowConflictException('La acción está en progreso');
    }
    action.complete();
    await this.actionRepo.save(action);
    this.eventBus.publish(new WorkflowStepActionStatusChangedEvent(opportunityId, accountId));
  }

  async skipAction(opportunityId: string, accountId: string, actionId: string): Promise<void> {
    const action = await this.getCurrentAction(opportunityId, accountId, actionId);
    if (action.status === 'IN_PROGRESS') {
      throw new OpportunityWorkflowConflictException('No se puede omitir una acción en progreso');
    }
    action.skip();
    await this.actionRepo.save(action);
    this.eventBus.publish(new WorkflowStepActionStatusChangedEvent(opportunityId, accountId));
  }

  async retryAction(opportunityId: string, accountId: string, actionId: string): Promise<void> {
    const action = await this.getCurrentAction(opportunityId, accountId, actionId);
    if (action.status !== 'FAILED') {
      throw new OpportunityWorkflowConflictException('Solo se pueden reintentar acciones fallidas');
    }
    action.retry();
    await this.actionRepo.save(action);
    this.eventBus.publish(new OpportunityStepActionsCreatedEvent(opportunityId, accountId));
  }

  async autoExecute(opportunityId: string, accountId: string): Promise<void> {
    const opportunity = await this.getOpportunity(opportunityId, accountId);
    if (!opportunity.workflowStepId) return;
    const actions = await this.actionRepo.findByOpportunityAndStep(opportunityId, opportunity.workflowStepId);
    for (const action of actions) {
      if (action.status !== 'PENDING' || action.targetType !== 'opportunity_status_update') continue;
      action.start();
      await this.actionRepo.save(action);
      try {
        if (!action.targetId) throw new Error('La acción no tiene estado destino');
        const pipelineId = action.metadata?.['pipelineId'];
        if (typeof pipelineId !== 'string') throw new Error('La acción no tiene pipeline destino');
        opportunity.transitionPipelineStatus(pipelineId, action.targetId);
        await this.opportunityRepo.save(opportunity);
        action.complete();
      } catch (error) {
        action.fail(error instanceof Error ? error.message : 'Error inesperado');
      }
      await this.actionRepo.save(action);
      this.eventBus.publish(new WorkflowStepActionStatusChangedEvent(opportunityId, accountId));
    }
  }

  async checkAndAdvance(opportunityId: string, accountId: string): Promise<void> {
    const opportunity = await this.getOpportunity(opportunityId, accountId);
    if (!opportunity.workflowId || !opportunity.workflowStepId) return;
    const step = await this.stepRepo.findById(opportunity.workflowStepId);
    if (!step) return;
    if (step.type === 'decision') {
      const result = await this.decisionRepo.findByOpportunityAndStep(opportunityId, step.id);
      if (result?.status !== 'TRUE') return;
    }
    const actions = await this.actionRepo.findByOpportunityAndStep(opportunityId, step.id);
    if (!actions.every((action) => action.isSettled)) return;
    await this.advance(opportunityId, accountId);
  }

  async advance(opportunityId: string, accountId: string): Promise<void> {
    const opportunity = await this.getOpportunity(opportunityId, accountId);
    if (!opportunity.workflowId || !opportunity.workflowStepId) return;
    const steps = (await this.stepRepo.findByWorkflowId(opportunity.workflowId)).sort(
      (a, b) => a.position - b.position,
    );
    const currentIndex = steps.findIndex((step) => step.id === opportunity.workflowStepId);
    const nextStep = currentIndex >= 0 ? steps[currentIndex + 1] : undefined;
    if (!nextStep) {
      this.eventBus.publish(new OpportunityWorkflowCompletedEvent(opportunityId, accountId));
      return;
    }
    opportunity.advanceWorkflowStep(nextStep.id);
    await this.opportunityRepo.save(opportunity);
    this.eventBus.publish(new OpportunityWorkflowStepEnteredEvent(opportunityId, accountId, nextStep.id));
  }

  async requestDecisionEvaluation(opportunityId: string, accountId: string, workflowStepId: string): Promise<void> {
    const opportunity = await this.getOpportunity(opportunityId, accountId);
    if (opportunity.workflowStepId !== workflowStepId) {
      throw new OpportunityWorkflowConflictException('Solo se puede reevaluar la decisión actual');
    }
    const actions = await this.actionRepo.findByOpportunityAndStep(opportunityId, workflowStepId);
    if (actions.some((action) => action.status === 'IN_PROGRESS')) {
      throw new OpportunityWorkflowConflictException('No se puede reevaluar con acciones en progreso');
    }
    let result = await this.decisionRepo.findByOpportunityAndStep(opportunityId, workflowStepId);
    if (!result) {
      result = WorkflowDecisionResult.create({
        id: this.idService.generate(),
        accountId,
        opportunityId,
        workflowStepId,
      });
    } else {
      result.requestEvaluation();
    }
    await this.decisionRepo.save(result);
    this.eventBus.publish(new WorkflowDecisionEvaluationRequestedEvent(opportunityId, accountId, workflowStepId));
  }

  async applyDecision(event: WorkflowDecisionEvaluatedEvent): Promise<void> {
    const opportunity = await this.getOpportunity(event.opportunityId, event.accountId);
    if (opportunity.workflowStepId !== event.workflowStepId) return;
    let result = await this.decisionRepo.findByOpportunityAndStep(event.opportunityId, event.workflowStepId);
    if (!result) {
      result = WorkflowDecisionResult.create({
        id: this.idService.generate(),
        accountId: event.accountId,
        opportunityId: event.opportunityId,
        workflowStepId: event.workflowStepId,
      });
    }
    result.resolve(event.status, event.evidence);
    await this.decisionRepo.save(result);
    if (event.status === 'TRUE') {
      await this.createCurrentStepActions(event.opportunityId, event.accountId, event.workflowStepId);
      return;
    }
    if (event.status !== 'FALSE') return;
    const actions = await this.actionRepo.findByOpportunityAndStep(event.opportunityId, event.workflowStepId);
    for (const action of actions) action.skip();
    if (actions.length) await this.actionRepo.saveMany(actions);
    await this.advance(event.opportunityId, event.accountId);
  }

  async find(opportunityId: string, accountId: string): Promise<OpportunityWorkflowDto> {
    const opportunity = await this.getOpportunity(opportunityId, accountId);
    if (!opportunity.workflowId || !opportunity.workflowStepId) {
      throw new OpportunityWorkflowConflictException('La oportunidad no tiene workflow asignado');
    }
    const workflow = await this.workflowRepo.findById(opportunity.workflowId);
    if (!workflow || workflow.accountId !== accountId) {
      throw new OpportunityWorkflowConflictException('El workflow asignado no existe');
    }
    const steps = (await this.stepRepo.findByWorkflowId(workflow.id)).sort((a, b) => a.position - b.position);
    const [defaults, actions, decisions] = await Promise.all([
      this.defaultActionRepo.findByWorkflowStepIds(steps.map((step) => step.id)),
      this.actionRepo.findByOpportunityId(opportunityId, accountId),
      this.decisionRepo.findByOpportunityId(opportunityId, accountId),
    ]);
    const current = steps.find((step) => step.id === opportunity.workflowStepId);
    const currentActions = actions.filter((action) => action.workflowStepId === opportunity.workflowStepId);
    const currentDecision = decisions.find((decision) => decision.workflowStepId === opportunity.workflowStepId);
    const isLast = steps[steps.length - 1]?.id === opportunity.workflowStepId;
    const isCompleted = Boolean(
      isLast &&
      current &&
      currentActions.every((action) => action.isSettled) &&
      (current.type !== 'decision' || currentDecision?.status === 'TRUE' || currentDecision?.status === 'FALSE'),
    );

    return {
      workflow: {
        id: workflow.id,
        accountId: workflow.accountId,
        name: workflow.name,
        description: workflow.description,
        stepsCount: steps.length,
        createdAt: workflow.createdAt.toISOString(),
        steps: steps.map((step) => ({
          id: step.id,
          workflowId: step.workflowId,
          name: step.name,
          type: step.type,
          condition: step.condition,
          position: step.position,
          actions: defaults
            .filter((action) => action.workflowStepId === step.id)
            .sort((a, b) => a.position - b.position)
            .map((action) => ({
              id: action.id,
              workflowStepId: action.workflowStepId,
              name: action.name,
              targetType: action.targetType,
              targetId: action.targetId,
              metadata: action.metadata,
              position: action.position,
            })),
        })),
      },
      currentStepId: opportunity.workflowStepId,
      status: isCompleted ? 'COMPLETED' : 'ACTIVE',
      actions: actions.map((action) => {
        const data = action.toPrimitives();
        return {
          id: data.id,
          opportunityId: data.opportunityId,
          workflowStepId: data.workflowStepId,
          defaultWorkflowStepActionId: data.defaultWorkflowStepActionId,
          name: data.name,
          targetType: data.targetType,
          targetId: data.targetId,
          metadata: data.metadata,
          position: data.position,
          status: data.status,
          errorMessage: data.errorMessage,
          completedAt: data.completedAt?.toISOString() ?? null,
          createdAt: data.createdAt.toISOString(),
          updatedAt: data.updatedAt.toISOString(),
        };
      }),
      decisions: decisions.map((decision) => {
        const data = decision.toPrimitives();
        return {
          id: data.id,
          opportunityId: data.opportunityId,
          workflowStepId: data.workflowStepId,
          status: data.status,
          evidence: data.evidence,
          evaluatedAt: data.evaluatedAt?.toISOString() ?? null,
          createdAt: data.createdAt.toISOString(),
          updatedAt: data.updatedAt.toISOString(),
        };
      }),
    };
  }

  private async getOpportunity(id: string, accountId: string) {
    const opportunity = await this.opportunityRepo.findById(id, accountId);
    if (!opportunity) throw new OpportunityNotFoundException(id);
    return opportunity;
  }

  private async getCurrentAction(opportunityId: string, accountId: string, actionId: string) {
    const opportunity = await this.getOpportunity(opportunityId, accountId);
    const action = await this.actionRepo.findById(actionId, opportunityId);
    if (!action || action.workflowStepId !== opportunity.workflowStepId) {
      throw new WorkflowRuntimeActionNotFoundException(actionId);
    }
    return action;
  }
}
