import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { WorkflowOrmEntity } from './infrastructure/persistence/workflow.orm-entity';
import { WorkflowStepOrmEntity } from './infrastructure/persistence/workflow-step.orm-entity';
import { DefaultWorkflowStepActionOrmEntity } from './infrastructure/persistence/default-workflow-step-action.orm-entity';
import { MikroOrmWorkflowRepository } from './infrastructure/persistence/mikro-orm-workflow.repository';
import { MikroOrmWorkflowStepRepository } from './infrastructure/persistence/mikro-orm-workflow-step.repository';
import { MikroOrmDefaultWorkflowStepActionRepository } from './infrastructure/persistence/mikro-orm-default-workflow-step-action.repository';
import { WorkflowRepository } from './domain/workflow.repository';
import { WorkflowStepRepository } from './domain/workflow-step.repository';
import { DefaultWorkflowStepActionRepository } from './domain/default-workflow-step-action.repository';

import { WorkflowController } from './infrastructure/io/workflow.controller';
import { IdService } from '@/shared/domain/services/id.service';

import { CreateWorkflowHandler } from './application/commands/create-workflow';
import { UpdateWorkflowHandler } from './application/commands/update-workflow';
import { DeleteWorkflowHandler } from './application/commands/delete-workflow';
import { DuplicateWorkflowHandler } from './application/commands/duplicate-workflow';
import { UpdateWorkflowStepsHandler } from './application/commands/update-workflow-steps';
import { CreateDefaultStepActionHandler } from './application/commands/create-default-step-action';
import { UpdateDefaultStepActionHandler } from './application/commands/update-default-step-action';
import { DeleteDefaultStepActionHandler } from './application/commands/delete-default-step-action';
import { FindAllWorkflowsHandler } from './application/queries/find-all-workflows';
import { FindWorkflowByIdHandler } from './application/queries/find-workflow-by-id';
import { AccountCreatedHandler } from './application/events/account-created.handler';

const commandHandlers = [
  CreateWorkflowHandler,
  UpdateWorkflowHandler,
  DeleteWorkflowHandler,
  DuplicateWorkflowHandler,
  UpdateWorkflowStepsHandler,
  CreateDefaultStepActionHandler,
  UpdateDefaultStepActionHandler,
  DeleteDefaultStepActionHandler,
];

const queryHandlers = [FindAllWorkflowsHandler, FindWorkflowByIdHandler];

const eventHandlers = [AccountCreatedHandler];

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([WorkflowOrmEntity, WorkflowStepOrmEntity, DefaultWorkflowStepActionOrmEntity]),
  ],
  controllers: [WorkflowController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    IdService,
    { provide: WorkflowRepository, useClass: MikroOrmWorkflowRepository },
    { provide: WorkflowStepRepository, useClass: MikroOrmWorkflowStepRepository },
    { provide: DefaultWorkflowStepActionRepository, useClass: MikroOrmDefaultWorkflowStepActionRepository },
  ],
  exports: [WorkflowRepository, WorkflowStepRepository, DefaultWorkflowStepActionRepository],
})
export class WorkflowModule {}
