import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { OpportunityOrmEntity } from './infrastructure/persistence/opportunity.orm-entity';
import { MikroOrmOpportunityRepository } from './infrastructure/persistence/mikro-orm-opportunity.repository';
import { OpportunityRepository } from './domain/opportunity.repository';
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

const commandHandlers = [
  CreateOpportunityHandler,
  UpdateOpportunityHandler,
  DeleteOpportunityHandler,
  TransitionOpportunityStatusHandler,
  UpdateOpportunityPositionHandler,
];

const queryHandlers = [
  FindAllOpportunitiesHandler,
  FindOpportunityByIdHandler,
  FindKanbanOpportunitiesHandler,
  FindPipelineStatusTotalsHandler,
];

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([OpportunityOrmEntity])],
  controllers: [OpportunityController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    IdService,
    { provide: OpportunityRepository, useClass: MikroOrmOpportunityRepository },
  ],
})
export class OpportunityModule {}
