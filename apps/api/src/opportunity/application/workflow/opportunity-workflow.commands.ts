import { Command } from '@nestjs/cqrs';

abstract class OpportunityWorkflowCommand extends Command<void> {
  protected constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}

export class AssignWorkflowToOpportunityCommand extends OpportunityWorkflowCommand {
  constructor(
    opportunityId: string,
    accountId: string,
    public readonly workflowId: string,
  ) {
    super(opportunityId, accountId);
  }
}

export class ChangeOpportunityWorkflowCommand extends AssignWorkflowToOpportunityCommand {}

export class CompleteWorkflowStepActionCommand extends OpportunityWorkflowCommand {
  constructor(
    opportunityId: string,
    accountId: string,
    public readonly actionId: string,
  ) {
    super(opportunityId, accountId);
  }
}

export class SkipWorkflowStepActionCommand extends CompleteWorkflowStepActionCommand {}
export class RetryWorkflowStepActionCommand extends CompleteWorkflowStepActionCommand {}
export class CheckAndAdvanceOpportunityWorkflowStepCommand extends OpportunityWorkflowCommand {
  constructor(opportunityId: string, accountId: string) {
    super(opportunityId, accountId);
  }
}
export class TriggerOpportunityStepAutoExecuteCommand extends OpportunityWorkflowCommand {
  constructor(opportunityId: string, accountId: string) {
    super(opportunityId, accountId);
  }
}

export class ReEvaluateWorkflowDecisionCommand extends OpportunityWorkflowCommand {
  constructor(
    opportunityId: string,
    accountId: string,
    public readonly workflowStepId: string,
  ) {
    super(opportunityId, accountId);
  }
}
