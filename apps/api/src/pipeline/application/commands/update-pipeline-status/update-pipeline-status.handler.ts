import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePipelineStatusCommand } from './update-pipeline-status.command';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';
import { PipelineStatusNotFoundException } from '../../../domain/exceptions/pipeline-status-not-found.exception';

@CommandHandler(UpdatePipelineStatusCommand)
export class UpdatePipelineStatusHandler implements ICommandHandler<UpdatePipelineStatusCommand, void> {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly statusRepo: PipelineStatusRepository,
  ) {}

  async execute(command: UpdatePipelineStatusCommand): Promise<void> {
    const pipeline = await this.pipelineRepo.findById(command.pipelineId);
    if (!pipeline || pipeline.accountId !== command.accountId) throw new PipelineNotFoundException(command.pipelineId);

    const status = await this.statusRepo.findById(command.id);
    if (!status || status.pipelineId !== command.pipelineId) throw new PipelineStatusNotFoundException(command.id);

    status.update({
      name: command.name,
      description: command.description,
      backgroundColor: command.backgroundColor,
      textColor: command.textColor,
      isTerminal: command.isTerminal,
      outcomeType: command.outcomeType,
      showInKanban: command.showInKanban,
    });

    await this.statusRepo.save(status);
  }
}
