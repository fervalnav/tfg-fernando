import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { AccountCreatedEvent } from '@/auth';
import { CreatePipelineCommand } from '../commands/create-pipeline';
import { IdService } from '@/shared/domain/services/id.service';

@EventsHandler(AccountCreatedEvent)
export class AccountCreatedHandler implements IEventHandler<AccountCreatedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly idService: IdService,
  ) {}

  async handle(event: AccountCreatedEvent): Promise<void> {
    await this.commandBus.execute(
      new CreatePipelineCommand(this.idService.generate(), event.accountId, 'Pipeline de licitaciones'),
    );
  }
}
