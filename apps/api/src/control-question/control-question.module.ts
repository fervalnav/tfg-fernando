import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IdService } from '@/shared/domain/services/id.service';
import { OpportunityModule } from '@/opportunity';
import { DefaultControlQuestionOrmEntity } from './infrastructure/persistence/default-control-question.orm-entity';
import { MikroOrmDefaultControlQuestionRepository } from './infrastructure/persistence/mikro-orm-default-control-question.repository';
import { DefaultControlQuestionRepository } from './domain/default-control-question.repository';
import { DefaultControlQuestionController } from './infrastructure/io/default-control-question.controller';
import { CreateDefaultControlQuestionHandler } from './application/commands/create-default-control-question';
import { UpdateDefaultControlQuestionHandler } from './application/commands/update-default-control-question';
import { DeleteDefaultControlQuestionHandler } from './application/commands/delete-default-control-question';
import { FindDefaultControlQuestionsHandler } from './application/queries/find-default-control-questions';
import { ControlQuestionOrmEntity } from './infrastructure/persistence/control-question.orm-entity';
import { ControlQuestionRepository } from './domain/control-question.repository';
import { MikroOrmControlQuestionRepository } from './infrastructure/persistence/mikro-orm-control-question.repository';
import { OpportunityControlQuestionController } from './infrastructure/io/opportunity-control-question.controller';
import { AnswerControlQuestionHandler } from './application/commands/answer-control-question';
import { FindOpportunityControlQuestionsHandler } from './application/queries/find-opportunity-control-questions';
import { ControlQuestionFromDefaultService } from './application/services/control-question-from-default.service';
import { AddControlQuestionToOpportunityHandler } from './application/commands/add-control-question-to-opportunity';

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => OpportunityModule),
    MikroOrmModule.forFeature([DefaultControlQuestionOrmEntity, ControlQuestionOrmEntity]),
  ],
  controllers: [DefaultControlQuestionController, OpportunityControlQuestionController],
  providers: [
    CreateDefaultControlQuestionHandler,
    UpdateDefaultControlQuestionHandler,
    DeleteDefaultControlQuestionHandler,
    FindDefaultControlQuestionsHandler,
    AnswerControlQuestionHandler,
    AddControlQuestionToOpportunityHandler,
    FindOpportunityControlQuestionsHandler,
    ControlQuestionFromDefaultService,
    IdService,
    { provide: DefaultControlQuestionRepository, useClass: MikroOrmDefaultControlQuestionRepository },
    { provide: ControlQuestionRepository, useClass: MikroOrmControlQuestionRepository },
  ],
  exports: [DefaultControlQuestionRepository, ControlQuestionFromDefaultService],
})
export class ControlQuestionModule {}
