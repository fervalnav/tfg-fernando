import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IdService } from '@/shared/domain/services/id.service';
import { OpportunityModule } from '@/opportunity';
import { AiModule } from '@/ai';
import { AttachmentModule } from '@/attachment';
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
import { RequestControlQuestionAiGenerationHandler } from './application/commands/request-control-question-ai-generation';
import { GenerateControlQuestionAnswerWithAiHandler } from './application/commands/generate-control-question-answer-with-ai';
import { ControlQuestionAiGenerationRequestedHandler } from './application/events/control-question-ai-generation-requested.handler';
import { OpportunityControlQuestionGenerationRequestedHandler } from './application/events/opportunity-control-question-generation-requested.handler';

@Module({
  imports: [
    CqrsModule,
    AiModule,
    forwardRef(() => OpportunityModule),
    forwardRef(() => AttachmentModule),
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
    RequestControlQuestionAiGenerationHandler,
    GenerateControlQuestionAnswerWithAiHandler,
    ControlQuestionAiGenerationRequestedHandler,
    OpportunityControlQuestionGenerationRequestedHandler,
    FindOpportunityControlQuestionsHandler,
    ControlQuestionFromDefaultService,
    IdService,
    { provide: DefaultControlQuestionRepository, useClass: MikroOrmDefaultControlQuestionRepository },
    { provide: ControlQuestionRepository, useClass: MikroOrmControlQuestionRepository },
  ],
  exports: [DefaultControlQuestionRepository, ControlQuestionRepository, ControlQuestionFromDefaultService],
})
export class ControlQuestionModule {}
