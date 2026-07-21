import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IdService } from '@/shared/domain/services/id.service';
import { DefaultControlQuestionOrmEntity } from './infrastructure/persistence/default-control-question.orm-entity';
import { MikroOrmDefaultControlQuestionRepository } from './infrastructure/persistence/mikro-orm-default-control-question.repository';
import { DefaultControlQuestionRepository } from './domain/default-control-question.repository';
import { DefaultControlQuestionController } from './infrastructure/io/default-control-question.controller';
import { CreateDefaultControlQuestionHandler } from './application/commands/create-default-control-question';
import { UpdateDefaultControlQuestionHandler } from './application/commands/update-default-control-question';
import { DeleteDefaultControlQuestionHandler } from './application/commands/delete-default-control-question';
import { FindDefaultControlQuestionsHandler } from './application/queries/find-default-control-questions';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([DefaultControlQuestionOrmEntity])],
  controllers: [DefaultControlQuestionController],
  providers: [
    CreateDefaultControlQuestionHandler,
    UpdateDefaultControlQuestionHandler,
    DeleteDefaultControlQuestionHandler,
    FindDefaultControlQuestionsHandler,
    IdService,
    { provide: DefaultControlQuestionRepository, useClass: MikroOrmDefaultControlQuestionRepository },
  ],
  exports: [DefaultControlQuestionRepository],
})
export class ControlQuestionModule {}
