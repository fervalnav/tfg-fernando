import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteWorkflowCommand } from './delete-workflow.command';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { WorkflowNotFoundException } from '../../../domain/exceptions/workflow-not-found.exception';

@CommandHandler(DeleteWorkflowCommand)
export class DeleteWorkflowHandler implements ICommandHandler<DeleteWorkflowCommand, void> {
  constructor(private readonly repo: WorkflowRepository) {}

  async execute(command: DeleteWorkflowCommand): Promise<void> {
    const workflow = await this.repo.findById(command.id);
    if (!workflow || workflow.accountId !== command.accountId) throw new WorkflowNotFoundException(command.id);

    await this.repo.delete(command.id);
  }
}
