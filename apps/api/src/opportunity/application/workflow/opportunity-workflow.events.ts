import type { WorkflowDecisionStatus } from '@tfg/types';
import { DomainEvent } from '@/shared/domain/domain-event';

export class OpportunityCreatedEvent extends DomainEvent {
  readonly eventName = 'opportunity.created';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly workflowId: string | null,
  ) {
    super();
  }
}

export class OpportunityWorkflowStepEnteredEvent extends DomainEvent {
  readonly eventName = 'opportunity.workflow.step.entered';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly workflowStepId: string,
  ) {
    super();
  }
}

export class OpportunityStepActionsCreatedEvent extends DomainEvent {
  readonly eventName = 'opportunity.workflow.actions.created';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}

export class WorkflowStepActionStatusChangedEvent extends DomainEvent {
  readonly eventName = 'opportunity.workflow.action.status-changed';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}

export class WorkflowDecisionEvaluationRequestedEvent extends DomainEvent {
  readonly eventName = 'opportunity.workflow.decision.evaluation-requested';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly workflowStepId: string,
  ) {
    super();
  }
}

export class WorkflowDecisionEvaluatedEvent extends DomainEvent {
  readonly eventName = 'opportunity.workflow.decision.evaluated';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly workflowStepId: string,
    public readonly status: Exclude<WorkflowDecisionStatus, 'PENDING'>,
    public readonly evidence: string | null,
  ) {
    super();
  }
}

export class OpportunityWorkflowCompletedEvent extends DomainEvent {
  readonly eventName = 'opportunity.workflow.completed';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
