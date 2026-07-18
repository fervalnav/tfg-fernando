import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePipelineCommand } from './update-pipeline.command';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';

@CommandHandler(UpdatePipelineCommand)
export class UpdatePipelineHandler implements ICommandHandler<UpdatePipelineCommand, void> {
  constructor(private readonly pipelineRepo: PipelineRepository) {}

  async execute(command: UpdatePipelineCommand): Promise<void> {
    const pipeline = await this.pipelineRepo.findById(command.id);
    if (!pipeline || pipeline.accountId !== command.accountId) throw new PipelineNotFoundException(command.id);

    pipeline.rename(command.name);
    await this.pipelineRepo.save(pipeline);
  }
}
