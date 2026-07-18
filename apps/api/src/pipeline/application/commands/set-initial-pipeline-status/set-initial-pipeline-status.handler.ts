import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetInitialPipelineStatusCommand } from './set-initial-pipeline-status.command';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';
import { PipelineStatusNotFoundException } from '../../../domain/exceptions/pipeline-status-not-found.exception';

@CommandHandler(SetInitialPipelineStatusCommand)
export class SetInitialPipelineStatusHandler implements ICommandHandler<SetInitialPipelineStatusCommand, void> {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly statusRepo: PipelineStatusRepository,
  ) {}

  async execute(command: SetInitialPipelineStatusCommand): Promise<void> {
    const pipeline = await this.pipelineRepo.findById(command.pipelineId);
    if (!pipeline || pipeline.accountId !== command.accountId) throw new PipelineNotFoundException(command.pipelineId);

    const allStatuses = await this.statusRepo.findByPipelineId(command.pipelineId);
    const target = allStatuses.find((s) => s.id === command.statusId);
    if (!target) throw new PipelineStatusNotFoundException(command.statusId);

    allStatuses.forEach((s) => s.setInitial(false));
    target.setInitial(true);

    await this.statusRepo.saveMany(allStatuses);
  }
}
