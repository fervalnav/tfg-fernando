import { CommandBus } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../services/opportunity-workflow.service';
import { AssignWorkflowToOpportunityCommand } from '../commands/assign-workflow-to-opportunity';
import { CheckAndAdvanceOpportunityWorkflowStepCommand } from '../commands/check-and-advance-opportunity-workflow-step';
import { TriggerOpportunityStepAutoExecuteCommand } from '../commands/trigger-opportunity-step-auto-execute';
import { OpportunityCreatedWorkflowHandler } from './opportunity-created-workflow.handler';
import { OpportunityQualificationUpdatedHandler } from './opportunity-qualification-updated.handler';
import { OpportunityStepActionsCreatedHandler } from './opportunity-step-actions-created.handler';
import { OpportunityWorkflowStepEnteredHandler } from './opportunity-workflow-step-entered.handler';
import {
  OpportunityCreatedEvent,
  OpportunityQualificationUpdatedEvent,
  OpportunityStepActionsCreatedEvent,
  OpportunityWorkflowStepEnteredEvent,
  WorkflowDecisionEvaluatedEvent,
  WorkflowStepActionStatusChangedEvent,
} from './opportunity-workflow.events';
import { WorkflowDecisionEvaluatedHandler } from './workflow-decision-evaluated.handler';
import { WorkflowStepActionStatusChangedHandler } from './workflow-step-action-status-changed.handler';

describe('Opportunity workflow event handlers', () => {
  const opportunityId = '019fa900-0000-7000-8000-000000000021';
  const accountId = '019fa900-0000-7000-8000-000000000022';
  const workflowId = '019fa900-0000-7000-8000-000000000023';
  const workflowStepId = '019fa900-0000-7000-8000-000000000024';
  const targetId = '019fa900-0000-7000-8000-000000000025';

  function createCommandBus() {
    const execute = jest.fn().mockResolvedValue(undefined);
    return { bus: { execute } as unknown as jest.Mocked<CommandBus>, execute };
  }

  function createService() {
    const initializeCurrentStep = jest.fn().mockResolvedValue(undefined);
    const applyDecision = jest.fn().mockResolvedValue(undefined);
    const completeQualificationActions = jest.fn().mockResolvedValue(undefined);
    const service = {
      initializeCurrentStep,
      applyDecision,
      completeQualificationActions,
    } as unknown as jest.Mocked<OpportunityWorkflowService>;
    return { service, initializeCurrentStep, applyDecision, completeQualificationActions };
  }

  it('assigns the configured workflow when an opportunity is created', async () => {
    const { bus, execute } = createCommandBus();
    const handler = new OpportunityCreatedWorkflowHandler(bus);

    await handler.handle(new OpportunityCreatedEvent(opportunityId, accountId, workflowId));

    expect(execute).toHaveBeenCalledWith(expect.any(AssignWorkflowToOpportunityCommand));
  });

  it('does nothing when a new opportunity has no workflow', async () => {
    const { bus, execute } = createCommandBus();
    const handler = new OpportunityCreatedWorkflowHandler(bus);

    await handler.handle(new OpportunityCreatedEvent(opportunityId, accountId, null));

    expect(execute).not.toHaveBeenCalled();
  });

  it('initializes the entered workflow step', async () => {
    const { service, initializeCurrentStep } = createService();
    const handler = new OpportunityWorkflowStepEnteredHandler(service);

    await handler.handle(new OpportunityWorkflowStepEnteredEvent(opportunityId, accountId, workflowStepId));

    expect(initializeCurrentStep).toHaveBeenCalledWith(opportunityId, accountId, workflowStepId);
  });

  it('triggers automatic execution and advancement after action creation', async () => {
    const { bus, execute } = createCommandBus();
    const handler = new OpportunityStepActionsCreatedHandler(bus);

    await handler.handle(new OpportunityStepActionsCreatedEvent(opportunityId, accountId));

    expect(execute).toHaveBeenNthCalledWith(1, expect.any(TriggerOpportunityStepAutoExecuteCommand));
    expect(execute).toHaveBeenNthCalledWith(2, expect.any(CheckAndAdvanceOpportunityWorkflowStepCommand));
  });

  it('checks advancement when an action changes status', async () => {
    const { bus, execute } = createCommandBus();
    const handler = new WorkflowStepActionStatusChangedHandler(bus);

    await handler.handle(new WorkflowStepActionStatusChangedEvent(opportunityId, accountId));

    expect(execute).toHaveBeenCalledWith(expect.any(CheckAndAdvanceOpportunityWorkflowStepCommand));
  });

  it('applies an evaluated decision', async () => {
    const { service, applyDecision } = createService();
    const handler = new WorkflowDecisionEvaluatedHandler(service);
    const event = new WorkflowDecisionEvaluatedEvent(opportunityId, accountId, workflowStepId, 'TRUE', 'Evidence');

    await handler.handle(event);

    expect(applyDecision).toHaveBeenCalledWith(event);
  });

  it('completes linked qualification actions after an instance update', async () => {
    const { service, completeQualificationActions } = createService();
    const handler = new OpportunityQualificationUpdatedHandler(service);

    await handler.handle(
      new OpportunityQualificationUpdatedEvent(opportunityId, accountId, 'control_question', targetId),
    );

    expect(completeQualificationActions).toHaveBeenCalledWith(opportunityId, accountId, 'control_question', targetId);
  });
});
