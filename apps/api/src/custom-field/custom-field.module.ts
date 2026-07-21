import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IdService } from '@/shared/domain/services/id.service';
import { DefaultCustomFieldOrmEntity } from './infrastructure/persistence/default-custom-field.orm-entity';
import { MikroOrmDefaultCustomFieldRepository } from './infrastructure/persistence/mikro-orm-default-custom-field.repository';
import { DefaultCustomFieldRepository } from './domain/default-custom-field.repository';
import { DefaultCustomFieldController } from './infrastructure/io/default-custom-field.controller';
import { CreateDefaultCustomFieldHandler } from './application/commands/create-default-custom-field';
import { UpdateDefaultCustomFieldHandler } from './application/commands/update-default-custom-field';
import { DeleteDefaultCustomFieldHandler } from './application/commands/delete-default-custom-field';
import { FindDefaultCustomFieldsHandler } from './application/queries/find-default-custom-fields';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([DefaultCustomFieldOrmEntity])],
  controllers: [DefaultCustomFieldController],
  providers: [
    CreateDefaultCustomFieldHandler,
    UpdateDefaultCustomFieldHandler,
    DeleteDefaultCustomFieldHandler,
    FindDefaultCustomFieldsHandler,
    IdService,
    { provide: DefaultCustomFieldRepository, useClass: MikroOrmDefaultCustomFieldRepository },
  ],
  exports: [DefaultCustomFieldRepository],
})
export class CustomFieldModule {}
