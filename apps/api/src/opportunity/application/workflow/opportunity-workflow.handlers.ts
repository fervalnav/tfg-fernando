import { CommandBus, CommandHandler, EventsHandler, type ICommandHandler, type IEventHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from './opportunity-workflow.service';
import {
  AssignWorkflowToOpportunityCommand,
  ChangeOpportunityWorkflowCommand,
  CheckAndAdvanceOpportunityWorkflowStepCommand,
  CompleteWorkflowStepActionCommand,
  ReEvaluateWorkflowDecisionCommand,
  RetryWorkflowStepActionCommand,
  SkipWorkflowStepActionCommand,
  TriggerOpportunityStepAutoExecuteCommand,
} from './opportunity-workflow.commands';
import {
  OpportunityCreatedEvent,
  OpportunityStepActionsCreatedEvent,
  OpportunityWorkflowStepEnteredEvent,
  WorkflowDecisionEvaluatedEvent,
  WorkflowStepActionStatusChangedEvent,
} from './opportunity-workflow.events';

@CommandHandler(AssignWorkflowToOpportunityCommand)
export class AssignWorkflowToOpportunityHandler implements ICommandHandler<AssignWorkflowToOpportunityCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(command: AssignWorkflowToOpportunityCommand): Promise<void> {
    await this.service.assign(command.opportunityId, command.accountId, command.workflowId, false);
  }
}

@CommandHandler(ChangeOpportunityWorkflowCommand)
export class ChangeOpportunityWorkflowHandler implements ICommandHandler<ChangeOpportunityWorkflowCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(command: ChangeOpportunityWorkflowCommand): Promise<void> {
    await this.service.assign(command.opportunityId, command.accountId, command.workflowId, true);
  }
}

@CommandHandler(CompleteWorkflowStepActionCommand)
export class CompleteWorkflowStepActionHandler implements ICommandHandler<CompleteWorkflowStepActionCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(command: CompleteWorkflowStepActionCommand): Promise<void> {
    await this.service.completeAction(command.opportunityId, command.accountId, command.actionId);
  }
}

@CommandHandler(SkipWorkflowStepActionCommand)
export class SkipWorkflowStepActionHandler implements ICommandHandler<SkipWorkflowStepActionCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(command: SkipWorkflowStepActionCommand): Promise<void> {
    await this.service.skipAction(command.opportunityId, command.accountId, command.actionId);
  }
}

@CommandHandler(RetryWorkflowStepActionCommand)
export class RetryWorkflowStepActionHandler implements ICommandHandler<RetryWorkflowStepActionCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(command: RetryWorkflowStepActionCommand): Promise<void> {
    await this.service.retryAction(command.opportunityId, command.accountId, command.actionId);
  }
}

@CommandHandler(CheckAndAdvanceOpportunityWorkflowStepCommand)
export class CheckAndAdvanceOpportunityWorkflowStepHandler implements ICommandHandler<
  CheckAndAdvanceOpportunityWorkflowStepCommand,
  void
> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(command: CheckAndAdvanceOpportunityWorkflowStepCommand): Promise<void> {
    await this.service.checkAndAdvance(command.opportunityId, command.accountId);
  }
}

@CommandHandler(TriggerOpportunityStepAutoExecuteCommand)
export class TriggerOpportunityStepAutoExecuteHandler implements ICommandHandler<
  TriggerOpportunityStepAutoExecuteCommand,
  void
> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(command: TriggerOpportunityStepAutoExecuteCommand): Promise<void> {
    await this.service.autoExecute(command.opportunityId, command.accountId);
  }
}

@CommandHandler(ReEvaluateWorkflowDecisionCommand)
export class ReEvaluateWorkflowDecisionHandler implements ICommandHandler<ReEvaluateWorkflowDecisionCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(command: ReEvaluateWorkflowDecisionCommand): Promise<void> {
    await this.service.requestDecisionEvaluation(command.opportunityId, command.accountId, command.workflowStepId);
  }
}

@EventsHandler(OpportunityCreatedEvent)
export class OpportunityCreatedWorkflowHandler implements IEventHandler<OpportunityCreatedEvent> {
  constructor(private readonly commandBus: CommandBus) {}
  async handle(event: OpportunityCreatedEvent): Promise<void> {
    if (!event.workflowId) return;
    await this.commandBus.execute(
      new AssignWorkflowToOpportunityCommand(event.opportunityId, event.accountId, event.workflowId),
    );
  }
}

@EventsHandler(OpportunityWorkflowStepEnteredEvent)
export class OpportunityWorkflowStepEnteredHandler implements IEventHandler<OpportunityWorkflowStepEnteredEvent> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async handle(event: OpportunityWorkflowStepEnteredEvent): Promise<void> {
    await this.service.initializeCurrentStep(event.opportunityId, event.accountId, event.workflowStepId);
  }
}

@EventsHandler(OpportunityStepActionsCreatedEvent)
export class OpportunityStepActionsCreatedHandler implements IEventHandler<OpportunityStepActionsCreatedEvent> {
  constructor(private readonly commandBus: CommandBus) {}
  async handle(event: OpportunityStepActionsCreatedEvent): Promise<void> {
    await this.commandBus.execute(new TriggerOpportunityStepAutoExecuteCommand(event.opportunityId, event.accountId));
    await this.commandBus.execute(
      new CheckAndAdvanceOpportunityWorkflowStepCommand(event.opportunityId, event.accountId),
    );
  }
}

@EventsHandler(WorkflowStepActionStatusChangedEvent)
export class WorkflowStepActionStatusChangedHandler implements IEventHandler<WorkflowStepActionStatusChangedEvent> {
  constructor(private readonly commandBus: CommandBus) {}
  async handle(event: WorkflowStepActionStatusChangedEvent): Promise<void> {
    await this.commandBus.execute(
      new CheckAndAdvanceOpportunityWorkflowStepCommand(event.opportunityId, event.accountId),
    );
  }
}

@EventsHandler(WorkflowDecisionEvaluatedEvent)
export class WorkflowDecisionEvaluatedHandler implements IEventHandler<WorkflowDecisionEvaluatedEvent> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async handle(event: WorkflowDecisionEvaluatedEvent): Promise<void> {
    await this.service.applyDecision(event);
  }
}

export const opportunityWorkflowCommandHandlers = [
  AssignWorkflowToOpportunityHandler,
  ChangeOpportunityWorkflowHandler,
  CompleteWorkflowStepActionHandler,
  SkipWorkflowStepActionHandler,
  RetryWorkflowStepActionHandler,
  CheckAndAdvanceOpportunityWorkflowStepHandler,
  TriggerOpportunityStepAutoExecuteHandler,
  ReEvaluateWorkflowDecisionHandler,
];

export const opportunityWorkflowEventHandlers = [
  OpportunityCreatedWorkflowHandler,
  OpportunityWorkflowStepEnteredHandler,
  OpportunityStepActionsCreatedHandler,
  WorkflowStepActionStatusChangedHandler,
  WorkflowDecisionEvaluatedHandler,
];
