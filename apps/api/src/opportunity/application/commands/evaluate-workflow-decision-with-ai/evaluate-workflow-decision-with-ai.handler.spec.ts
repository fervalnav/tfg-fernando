/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { WorkflowStep, WorkflowStepRepository } from '@/workflow';
import { WorkflowDecisionResult } from '../../../domain/workflow-decision-result.entity';
import { WorkflowDecisionResultRepository } from '../../../domain/workflow-decision-result.repository';
import { WorkflowDecisionEvaluatedEvent } from '../../events/opportunity-workflow.events';
import { OpportunityFinder } from '../../services/opportunity.finder';
import { EvaluateWorkflowDecisionWithAiCommand } from './evaluate-workflow-decision-with-ai.command';
import { EvaluateWorkflowDecisionWithAiHandler } from './evaluate-workflow-decision-with-ai.handler';

describe('EvaluateWorkflowDecisionWithAiHandler', () => {
  const opportunityId = 'opportunity-id';
  const accountId = 'account-id';
  const workflowStepId = 'step-id';

  function createDecision() {
    const decision = WorkflowDecisionResult.create({
      id: 'decision-id',
      accountId,
      opportunityId,
      workflowStepId,
    });
    decision.pullDomainEvents();
    return decision;
  }

  function createStep() {
    return WorkflowStep.create({
      id: workflowStepId,
      workflowId: 'workflow-id',
      name: 'Viabilidad',
      type: 'decision',
      condition: 'El importe debe ser superior a 1000 EUR',
      position: 1,
    });
  }

  function createHandler(generateStructured: jest.Mock) {
    const eventBus = { publishAll: jest.fn() } as unknown as jest.Mocked<EventBus>;
    const handler = new EvaluateWorkflowDecisionWithAiHandler(
      {
        findByOpportunityAndStep: jest.fn().mockResolvedValue(createDecision()),
        save: jest.fn().mockResolvedValue(undefined),
      } as unknown as WorkflowDecisionResultRepository,
      { findById: jest.fn().mockResolvedValue(createStep()) } as unknown as WorkflowStepRepository,
      {
        find: jest.fn().mockResolvedValue({
          workflowStepId,
          title: 'Contrato',
          description: 'Contrato de 5000 euros',
          amount: 5000,
          currency: 'EUR',
          dueDate: null,
        }),
      } as unknown as OpportunityFinder,
      { findByOpportunityId: jest.fn().mockResolvedValue([]) } as never,
      { findByOpportunityId: jest.fn().mockResolvedValue([]) } as never,
      { findByOpportunityId: jest.fn().mockResolvedValue([]) } as never,
      { generateStructured },
      { find: jest.fn().mockResolvedValue([]) } as never,
      eventBus,
    );
    return { handler, eventBus };
  }

  it('publishes a true decision with evidence', async () => {
    const { handler, eventBus } = createHandler(
      jest.fn().mockResolvedValue({
        value: { result: true, evidence: 'El importe supera el umbral' },
        provider: 'fake',
        model: 'fake',
        durationMs: 1,
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      }),
    );

    await handler.execute(new EvaluateWorkflowDecisionWithAiCommand(opportunityId, accountId, workflowStepId));

    expect(eventBus.publishAll).toHaveBeenCalledWith([
      expect.objectContaining<Partial<WorkflowDecisionEvaluatedEvent>>({
        status: 'TRUE',
        evidence: 'El importe supera el umbral',
      }),
    ]);
  });

  it('publishes an error decision when the provider fails', async () => {
    const { handler, eventBus } = createHandler(jest.fn().mockRejectedValue(new Error('Proveedor no disponible')));

    await handler.execute(new EvaluateWorkflowDecisionWithAiCommand(opportunityId, accountId, workflowStepId));

    expect(eventBus.publishAll).toHaveBeenCalledWith([
      expect.objectContaining<Partial<WorkflowDecisionEvaluatedEvent>>({
        status: 'ERROR',
        evidence: 'Proveedor no disponible',
      }),
    ]);
  });
});
