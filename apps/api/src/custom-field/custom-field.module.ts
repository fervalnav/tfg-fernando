import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IdService } from '@/shared/domain/services/id.service';
import { OpportunityModule } from '@/opportunity';
import { DefaultCustomFieldOrmEntity } from './infrastructure/persistence/default-custom-field.orm-entity';
import { MikroOrmDefaultCustomFieldRepository } from './infrastructure/persistence/mikro-orm-default-custom-field.repository';
import { DefaultCustomFieldRepository } from './domain/default-custom-field.repository';
import { DefaultCustomFieldController } from './infrastructure/io/default-custom-field.controller';
import { CreateDefaultCustomFieldHandler } from './application/commands/create-default-custom-field';
import { UpdateDefaultCustomFieldHandler } from './application/commands/update-default-custom-field';
import { DeleteDefaultCustomFieldHandler } from './application/commands/delete-default-custom-field';
import { FindDefaultCustomFieldsHandler } from './application/queries/find-default-custom-fields';
import { CustomFieldOrmEntity } from './infrastructure/persistence/custom-field.orm-entity';
import { CustomFieldRepository } from './domain/custom-field.repository';
import { MikroOrmCustomFieldRepository } from './infrastructure/persistence/mikro-orm-custom-field.repository';
import { OpportunityCustomFieldController } from './infrastructure/io/opportunity-custom-field.controller';
import { SetCustomFieldValueHandler } from './application/commands/set-custom-field-value';
import { FindOpportunityCustomFieldsHandler } from './application/queries/find-opportunity-custom-fields';
import { CustomFieldFromDefaultService } from './application/services/custom-field-from-default.service';
import { AddCustomFieldToOpportunityHandler } from './application/commands/add-custom-field-to-opportunity';

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => OpportunityModule),
    MikroOrmModule.forFeature([DefaultCustomFieldOrmEntity, CustomFieldOrmEntity]),
  ],
  controllers: [DefaultCustomFieldController, OpportunityCustomFieldController],
  providers: [
    CreateDefaultCustomFieldHandler,
    UpdateDefaultCustomFieldHandler,
    DeleteDefaultCustomFieldHandler,
    FindDefaultCustomFieldsHandler,
    SetCustomFieldValueHandler,
    AddCustomFieldToOpportunityHandler,
    FindOpportunityCustomFieldsHandler,
    CustomFieldFromDefaultService,
    IdService,
    { provide: DefaultCustomFieldRepository, useClass: MikroOrmDefaultCustomFieldRepository },
    { provide: CustomFieldRepository, useClass: MikroOrmCustomFieldRepository },
  ],
  exports: [DefaultCustomFieldRepository, CustomFieldFromDefaultService],
})
export class CustomFieldModule {}
