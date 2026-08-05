import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { PipelineOrmEntity } from './infrastructure/persistence/pipeline.orm-entity';
import { PipelineStatusOrmEntity } from './infrastructure/persistence/pipeline-status.orm-entity';
import { MikroOrmPipelineRepository } from './infrastructure/persistence/mikro-orm-pipeline.repository';
import { MikroOrmPipelineStatusRepository } from './infrastructure/persistence/mikro-orm-pipeline-status.repository';
import { PipelineRepository } from './domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from './domain/repositories/pipeline-status.repository';

import { PipelineController } from './infrastructure/io/pipeline.controller';
import { IdService } from '@/shared/domain/services/id.service';

import { CreatePipelineHandler } from './application/commands/create-pipeline';
import { UpdatePipelineHandler } from './application/commands/update-pipeline';
import { DeletePipelineHandler } from './application/commands/delete-pipeline';
import { CreatePipelineStatusHandler } from './application/commands/create-pipeline-status';
import { UpdatePipelineStatusHandler } from './application/commands/update-pipeline-status';
import { DeletePipelineStatusHandler } from './application/commands/delete-pipeline-status';
import { ReorderPipelineStatusesHandler } from './application/commands/reorder-pipeline-statuses';
import { SetInitialPipelineStatusHandler } from './application/commands/set-initial-pipeline-status';
import { FindAllPipelinesHandler } from './application/queries/find-all-pipelines';
import { FindPipelineByIdHandler } from './application/queries/find-pipeline-by-id';
import { AccountCreatedHandler } from './application/events/account-created.handler';

const commandHandlers = [
  CreatePipelineHandler,
  UpdatePipelineHandler,
  DeletePipelineHandler,
  CreatePipelineStatusHandler,
  UpdatePipelineStatusHandler,
  DeletePipelineStatusHandler,
  ReorderPipelineStatusesHandler,
  SetInitialPipelineStatusHandler,
];

const queryHandlers = [FindAllPipelinesHandler, FindPipelineByIdHandler];

const eventHandlers = [AccountCreatedHandler];

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([PipelineOrmEntity, PipelineStatusOrmEntity])],
  controllers: [PipelineController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    IdService,
    { provide: PipelineRepository, useClass: MikroOrmPipelineRepository },
    { provide: PipelineStatusRepository, useClass: MikroOrmPipelineStatusRepository },
  ],
})
export class PipelineModule {}
