import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IdService } from '@/shared/domain/services/id.service';
import { OpportunityModule } from '@/opportunity';
import { SummaryTemplateOrmEntity } from './infrastructure/persistence/summary-template.orm-entity';
import { MikroOrmSummaryTemplateRepository } from './infrastructure/persistence/mikro-orm-summary-template.repository';
import { SummaryTemplateRepository } from './domain/summary-template.repository';
import { SummaryTemplateController } from './infrastructure/io/summary-template.controller';
import { CreateSummaryTemplateHandler } from './application/commands/create-summary-template';
import { UpdateSummaryTemplateHandler } from './application/commands/update-summary-template';
import { DeleteSummaryTemplateHandler } from './application/commands/delete-summary-template';
import { FindSummaryTemplatesHandler } from './application/queries/find-summary-templates';
import { SummaryOrmEntity } from './infrastructure/persistence/summary.orm-entity';
import { SummaryRepository } from './domain/summary.repository';
import { MikroOrmSummaryRepository } from './infrastructure/persistence/mikro-orm-summary.repository';
import { OpportunitySummaryController } from './infrastructure/io/opportunity-summary.controller';
import { UpdateSummaryResultHandler } from './application/commands/update-summary-result';
import { FindOpportunitySummariesHandler } from './application/queries/find-opportunity-summaries';
import { SummaryFromTemplateService } from './application/services/summary-from-template.service';
import { AddSummaryToOpportunityHandler } from './application/commands/add-summary-to-opportunity';

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => OpportunityModule),
    MikroOrmModule.forFeature([SummaryTemplateOrmEntity, SummaryOrmEntity]),
  ],
  controllers: [SummaryTemplateController, OpportunitySummaryController],
  providers: [
    CreateSummaryTemplateHandler,
    UpdateSummaryTemplateHandler,
    DeleteSummaryTemplateHandler,
    FindSummaryTemplatesHandler,
    UpdateSummaryResultHandler,
    AddSummaryToOpportunityHandler,
    FindOpportunitySummariesHandler,
    SummaryFromTemplateService,
    IdService,
    { provide: SummaryTemplateRepository, useClass: MikroOrmSummaryTemplateRepository },
    { provide: SummaryRepository, useClass: MikroOrmSummaryRepository },
  ],
  exports: [SummaryTemplateRepository, SummaryFromTemplateService],
})
export class SummaryModule {}
