import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateWorkflowCommand } from './create-workflow.command';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { Workflow } from '../../../domain/workflow.entity';

@CommandHandler(CreateWorkflowCommand)
export class CreateWorkflowHandler implements ICommandHandler<CreateWorkflowCommand, void> {
  constructor(private readonly repo: WorkflowRepository) {}

  async execute(command: CreateWorkflowCommand): Promise<void> {
    const workflow = Workflow.create({
      id: command.id,
      accountId: command.accountId,
      name: command.name,
      description: command.description ?? undefined,
    });
    await this.repo.save(workflow);
  }
}
