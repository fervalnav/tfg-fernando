import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IdService } from '@/shared/domain/services/id.service';
import { SummaryTemplateOrmEntity } from './infrastructure/persistence/summary-template.orm-entity';
import { MikroOrmSummaryTemplateRepository } from './infrastructure/persistence/mikro-orm-summary-template.repository';
import { SummaryTemplateRepository } from './domain/summary-template.repository';
import { SummaryTemplateController } from './infrastructure/io/summary-template.controller';
import { CreateSummaryTemplateHandler } from './application/commands/create-summary-template';
import { UpdateSummaryTemplateHandler } from './application/commands/update-summary-template';
import { DeleteSummaryTemplateHandler } from './application/commands/delete-summary-template';
import { FindSummaryTemplatesHandler } from './application/queries/find-summary-templates';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([SummaryTemplateOrmEntity])],
  controllers: [SummaryTemplateController],
  providers: [
    CreateSummaryTemplateHandler,
    UpdateSummaryTemplateHandler,
    DeleteSummaryTemplateHandler,
    FindSummaryTemplatesHandler,
    IdService,
    { provide: SummaryTemplateRepository, useClass: MikroOrmSummaryTemplateRepository },
  ],
  exports: [SummaryTemplateRepository],
})
export class SummaryModule {}
