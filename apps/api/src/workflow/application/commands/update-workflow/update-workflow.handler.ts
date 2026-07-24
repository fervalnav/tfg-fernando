import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateWorkflowCommand } from './update-workflow.command';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { WorkflowNotFoundException } from '../../../domain/exceptions/workflow-not-found.exception';

@CommandHandler(UpdateWorkflowCommand)
export class UpdateWorkflowHandler implements ICommandHandler<UpdateWorkflowCommand, void> {
  constructor(private readonly repo: WorkflowRepository) {}

  async execute(command: UpdateWorkflowCommand): Promise<void> {
    const workflow = await this.repo.findById(command.id);
    if (!workflow || workflow.accountId !== command.accountId) throw new WorkflowNotFoundException(command.id);

    workflow.update(command.name, command.description);
    await this.repo.save(workflow);
  }
}
