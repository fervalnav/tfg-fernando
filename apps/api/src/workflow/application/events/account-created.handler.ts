import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { AccountCreatedEvent } from '@/auth';
import { CreateWorkflowCommand } from '../commands/create-workflow';
import { UpdateWorkflowStepsCommand } from '../commands/update-workflow-steps';
import { IdService } from '@/shared/domain/services/id.service';

@EventsHandler(AccountCreatedEvent)
export class AccountCreatedHandler implements IEventHandler<AccountCreatedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly idService: IdService,
  ) {}

  async handle(event: AccountCreatedEvent): Promise<void> {
    const workflowId = this.idService.generate();
    await this.commandBus.execute(new CreateWorkflowCommand(workflowId, event.accountId, 'Workflow por defecto', null));

    await this.commandBus.execute(
      new UpdateWorkflowStepsCommand(workflowId, event.accountId, [
        { id: this.idService.generate(), name: 'Cualificación', type: 'step', condition: null, position: 1 },
        { id: this.idService.generate(), name: 'Propuesta', type: 'step', condition: null, position: 2 },
        {
          id: this.idService.generate(),
          name: 'Cierre',
          type: 'decision',
          condition: '¿Se ha firmado el contrato?',
          position: 3,
        },
      ]),
    );
  }
}
