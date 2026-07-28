import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WorkflowModule } from '@/workflow';

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
import { OpportunityWorkflowService } from './application/workflow/opportunity-workflow.service';
import {
  opportunityWorkflowCommandHandlers,
  opportunityWorkflowEventHandlers,
} from './application/workflow/opportunity-workflow.handlers';
import { FindOpportunityWorkflowHandler } from './application/workflow/find-opportunity-workflow.query';
import {
  FindOpportunityDecisionResultsHandler,
  FindOpportunityStepActionsHandler,
} from './application/workflow/find-opportunity-workflow-runtime.query';

const commandHandlers = [
  CreateOpportunityHandler,
  UpdateOpportunityHandler,
  DeleteOpportunityHandler,
  TransitionOpportunityStatusHandler,
  UpdateOpportunityPositionHandler,
  ...opportunityWorkflowCommandHandlers,
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

@Module({
  imports: [
    CqrsModule,
    WorkflowModule,
    MikroOrmModule.forFeature([OpportunityOrmEntity, WorkflowStepActionOrmEntity, WorkflowDecisionResultOrmEntity]),
  ],
  controllers: [OpportunityController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...opportunityWorkflowEventHandlers,
    OpportunityWorkflowService,
    IdService,
    { provide: OpportunityRepository, useClass: MikroOrmOpportunityRepository },
    { provide: WorkflowStepActionRepository, useClass: MikroOrmWorkflowStepActionRepository },
    { provide: WorkflowDecisionResultRepository, useClass: MikroOrmWorkflowDecisionResultRepository },
  ],
})
export class OpportunityModule {}
