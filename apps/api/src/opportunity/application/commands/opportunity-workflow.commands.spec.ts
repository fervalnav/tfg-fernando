import { OpportunityWorkflowService } from '../services/opportunity-workflow.service';
import {
  AssignWorkflowToOpportunityCommand,
  AssignWorkflowToOpportunityHandler,
} from './assign-workflow-to-opportunity';
import { ChangeOpportunityWorkflowCommand, ChangeOpportunityWorkflowHandler } from './change-opportunity-workflow';
import {
  CheckAndAdvanceOpportunityWorkflowStepCommand,
  CheckAndAdvanceOpportunityWorkflowStepHandler,
} from './check-and-advance-opportunity-workflow-step';
import { CompleteWorkflowStepActionCommand, CompleteWorkflowStepActionHandler } from './complete-workflow-step-action';
import { ReEvaluateWorkflowDecisionCommand, ReEvaluateWorkflowDecisionHandler } from './re-evaluate-workflow-decision';
import { RetryWorkflowStepActionCommand, RetryWorkflowStepActionHandler } from './retry-workflow-step-action';
import { SkipWorkflowStepActionCommand, SkipWorkflowStepActionHandler } from './skip-workflow-step-action';
import {
  TriggerOpportunityStepAutoExecuteCommand,
  TriggerOpportunityStepAutoExecuteHandler,
} from './trigger-opportunity-step-auto-execute';

describe('Opportunity workflow command handlers', () => {
  const opportunityId = '019fa900-0000-7000-8000-000000000001';
  const accountId = '019fa900-0000-7000-8000-000000000002';
  const workflowId = '019fa900-0000-7000-8000-000000000003';
  const actionId = '019fa900-0000-7000-8000-000000000004';
  const workflowStepId = '019fa900-0000-7000-8000-000000000005';

  function createService() {
    const assign = jest.fn().mockResolvedValue(undefined);
    const completeAction = jest.fn().mockResolvedValue(undefined);
    const skipAction = jest.fn().mockResolvedValue(undefined);
    const retryAction = jest.fn().mockResolvedValue(undefined);
    const checkAndAdvance = jest.fn().mockResolvedValue(undefined);
    const autoExecute = jest.fn().mockResolvedValue(undefined);
    const requestDecisionEvaluation = jest.fn().mockResolvedValue(undefined);
    const service = {
      assign,
      completeAction,
      skipAction,
      retryAction,
      checkAndAdvance,
      autoExecute,
      requestDecisionEvaluation,
    } as unknown as jest.Mocked<OpportunityWorkflowService>;
    return {
      service,
      assign,
      completeAction,
      skipAction,
      retryAction,
      checkAndAdvance,
      autoExecute,
      requestDecisionEvaluation,
    };
  }

  it('assigns a workflow without replacement', async () => {
    const { service, assign } = createService();
    const handler = new AssignWorkflowToOpportunityHandler(service);

    await handler.execute(new AssignWorkflowToOpportunityCommand(opportunityId, accountId, workflowId));

    expect(assign).toHaveBeenCalledWith(opportunityId, accountId, workflowId, false);
  });

  it('changes a workflow with replacement', async () => {
    const { service, assign } = createService();
    const handler = new ChangeOpportunityWorkflowHandler(service);

    await handler.execute(new ChangeOpportunityWorkflowCommand(opportunityId, accountId, workflowId));

    expect(assign).toHaveBeenCalledWith(opportunityId, accountId, workflowId, true);
  });

  it('completes an action', async () => {
    const { service, completeAction } = createService();
    const handler = new CompleteWorkflowStepActionHandler(service);

    await handler.execute(new CompleteWorkflowStepActionCommand(opportunityId, accountId, actionId));

    expect(completeAction).toHaveBeenCalledWith(opportunityId, accountId, actionId);
  });

  it('skips an action', async () => {
    const { service, skipAction } = createService();
    const handler = new SkipWorkflowStepActionHandler(service);

    await handler.execute(new SkipWorkflowStepActionCommand(opportunityId, accountId, actionId));

    expect(skipAction).toHaveBeenCalledWith(opportunityId, accountId, actionId);
  });

  it('retries an action', async () => {
    const { service, retryAction } = createService();
    const handler = new RetryWorkflowStepActionHandler(service);

    await handler.execute(new RetryWorkflowStepActionCommand(opportunityId, accountId, actionId));

    expect(retryAction).toHaveBeenCalledWith(opportunityId, accountId, actionId);
  });

  it('checks and advances the current step', async () => {
    const { service, checkAndAdvance } = createService();
    const handler = new CheckAndAdvanceOpportunityWorkflowStepHandler(service);

    await handler.execute(new CheckAndAdvanceOpportunityWorkflowStepCommand(opportunityId, accountId));

    expect(checkAndAdvance).toHaveBeenCalledWith(opportunityId, accountId);
  });

  it('triggers automatic actions', async () => {
    const { service, autoExecute } = createService();
    const handler = new TriggerOpportunityStepAutoExecuteHandler(service);

    await handler.execute(new TriggerOpportunityStepAutoExecuteCommand(opportunityId, accountId));

    expect(autoExecute).toHaveBeenCalledWith(opportunityId, accountId);
  });

  it('requests a decision reevaluation', async () => {
    const { service, requestDecisionEvaluation } = createService();
    const handler = new ReEvaluateWorkflowDecisionHandler(service);

    await handler.execute(new ReEvaluateWorkflowDecisionCommand(opportunityId, accountId, workflowStepId));

    expect(requestDecisionEvaluation).toHaveBeenCalledWith(opportunityId, accountId, workflowStepId);
  });
});
