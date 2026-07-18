import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePipelineStatusCommand } from './delete-pipeline-status.command';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';
import { PipelineStatusNotFoundException } from '../../../domain/exceptions/pipeline-status-not-found.exception';

@CommandHandler(DeletePipelineStatusCommand)
export class DeletePipelineStatusHandler implements ICommandHandler<DeletePipelineStatusCommand, void> {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly statusRepo: PipelineStatusRepository,
  ) {}

  async execute(command: DeletePipelineStatusCommand): Promise<void> {
    const pipeline = await this.pipelineRepo.findById(command.pipelineId);
    if (!pipeline || pipeline.accountId !== command.accountId) throw new PipelineNotFoundException(command.pipelineId);

    const status = await this.statusRepo.findById(command.id);
    if (!status || status.pipelineId !== command.pipelineId) throw new PipelineStatusNotFoundException(command.id);

    await this.statusRepo.delete(command.id);
  }
}
