import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WorkflowModule } from '@/workflow';
import { ControlQuestionModule } from '@/control-question';
import { CustomFieldModule } from '@/custom-field';
import { SummaryModule } from '@/summary';

import { OpportunityOrmEntity } from './infrastructure/persistence/opportunity.orm-entity';
import { WorkflowStepActionOrmEntity } from './infrastructure/persistence/workflow-step-action.orm-entity';
import { WorkflowDecisionResultOrmEntity } from './infrastructure/persistence/workflow-decision-result.orm-entity';
import { MikroOrmOpportunityRepository } from './infrastructure/persistence/mikro-orm-opportunity.repository';
import { OpportunityRepository } from './domain/opportunity.repository';
import { WorkflowStepActionRepository } from './domain/workflow-step-action.repository';
import { WorkflowDecisionResultRepository } from './domain/workflow-decision-result.repository';
import { MikroOrmWorkflowStepActionRepository } from './infrastructure/persistence/mikro-orm-workflow-step-action.repository';
import { MikroOrmWorkflowDecisionResultRepository } from './infrastructure/persistence/mikro-orm-workflow-decision-result.repository';
import { OpportunityController } from './infrastructure/io/opportunity.controller';
import { IdService } from '@/shared/domain/services/id.service';

import { CreateOpportunityHandler } from './application/commands/create-opportunity';
import { UpdateOpportunityHandler } from './application/commands/update-opportunity';
import { DeleteOpportunityHandler } from './application/commands/delete-opportunity';
import { TransitionOpportunityStatusHandler } from './application/commands/transition-opportunity-status';
import { UpdateOpportunityPositionHandler } from './application/commands/update-opportunity-position';
import { FindAllOpportunitiesHandler } from './application/queries/find-all-opportunities';
import { FindOpportunityByIdHandler } from './application/queries/find-opportunity-by-id';
import { FindKanbanOpportunitiesHandler } from './application/queries/find-kanban-opportunities';
import { FindPipelineStatusTotalsHandler } from './application/queries/find-pipeline-status-totals';
import { AssignWorkflowToOpportunityHandler } from './application/commands/assign-workflow-to-opportunity';
import { ChangeOpportunityWorkflowHandler } from './application/commands/change-opportunity-workflow';
import { CheckAndAdvanceOpportunityWorkflowStepHandler } from './application/commands/check-and-advance-opportunity-workflow-step';
import { CompleteWorkflowStepActionHandler } from './application/commands/complete-workflow-step-action';
import { ReEvaluateWorkflowDecisionHandler } from './application/commands/re-evaluate-workflow-decision';
import { RetryWorkflowStepActionHandler } from './application/commands/retry-workflow-step-action';
import { SkipWorkflowStepActionHandler } from './application/commands/skip-workflow-step-action';
import { TriggerOpportunityStepAutoExecuteHandler } from './application/commands/trigger-opportunity-step-auto-execute';
import { FindOpportunityWorkflowHandler } from './application/queries/find-opportunity-workflow';
import { FindOpportunityStepActionsHandler } from './application/queries/find-opportunity-step-actions';
import { FindOpportunityDecisionResultsHandler } from './application/queries/find-opportunity-decision-results';
import { OpportunityCreatedWorkflowHandler } from './application/events/opportunity-created-workflow.handler';
import { OpportunityQualificationUpdatedHandler } from './application/events/opportunity-qualification-updated.handler';
import { OpportunityStepActionsCreatedHandler } from './application/events/opportunity-step-actions-created.handler';
import { OpportunityWorkflowStepEnteredHandler } from './application/events/opportunity-workflow-step-entered.handler';
import { WorkflowDecisionEvaluatedHandler } from './application/events/workflow-decision-evaluated.handler';
import { WorkflowStepActionStatusChangedHandler } from './application/events/workflow-step-action-status-changed.handler';
import { OpportunityWorkflowService } from './application/services/opportunity-workflow.service';
import { OpportunityFinder } from './application/services/opportunity.finder';

const commandHandlers = [
  CreateOpportunityHandler,
  UpdateOpportunityHandler,
  DeleteOpportunityHandler,
  TransitionOpportunityStatusHandler,
  UpdateOpportunityPositionHandler,
  AssignWorkflowToOpportunityHandler,
  ChangeOpportunityWorkflowHandler,
  CompleteWorkflowStepActionHandler,
  SkipWorkflowStepActionHandler,
  RetryWorkflowStepActionHandler,
  CheckAndAdvanceOpportunityWorkflowStepHandler,
  TriggerOpportunityStepAutoExecuteHandler,
  ReEvaluateWorkflowDecisionHandler,
];

const queryHandlers = [
  FindAllOpportunitiesHandler,
  FindOpportunityByIdHandler,
  FindKanbanOpportunitiesHandler,
  FindPipelineStatusTotalsHandler,
  FindOpportunityWorkflowHandler,
  FindOpportunityStepActionsHandler,
  FindOpportunityDecisionResultsHandler,
];

const eventHandlers = [
  OpportunityCreatedWorkflowHandler,
  OpportunityWorkflowStepEnteredHandler,
  OpportunityStepActionsCreatedHandler,
  WorkflowStepActionStatusChangedHandler,
  WorkflowDecisionEvaluatedHandler,
  OpportunityQualificationUpdatedHandler,
];

@Module({
  imports: [
    CqrsModule,
    WorkflowModule,
    forwardRef(() => ControlQuestionModule),
    forwardRef(() => CustomFieldModule),
    forwardRef(() => SummaryModule),
    MikroOrmModule.forFeature([OpportunityOrmEntity, WorkflowStepActionOrmEntity, WorkflowDecisionResultOrmEntity]),
  ],
  controllers: [OpportunityController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    OpportunityWorkflowService,
    OpportunityFinder,
    IdService,
    { provide: OpportunityRepository, useClass: MikroOrmOpportunityRepository },
    { provide: WorkflowStepActionRepository, useClass: MikroOrmWorkflowStepActionRepository },
    { provide: WorkflowDecisionResultRepository, useClass: MikroOrmWorkflowDecisionResultRepository },
  ],
  exports: [OpportunityFinder],
})
export class OpportunityModule {}
