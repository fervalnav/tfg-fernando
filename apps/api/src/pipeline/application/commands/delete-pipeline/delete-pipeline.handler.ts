import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePipelineCommand } from './delete-pipeline.command';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';

@CommandHandler(DeletePipelineCommand)
export class DeletePipelineHandler implements ICommandHandler<DeletePipelineCommand, void> {
  constructor(private readonly pipelineRepo: PipelineRepository) {}

  async execute(command: DeletePipelineCommand): Promise<void> {
    const pipeline = await this.pipelineRepo.findById(command.id);
    if (!pipeline || pipeline.accountId !== command.accountId) throw new PipelineNotFoundException(command.id);

    await this.pipelineRepo.delete(command.id);
  }
}
