import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePipelineStatusCommand } from './create-pipeline-status.command';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineStatus } from '../../../domain/pipeline-status.entity';
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';

@CommandHandler(CreatePipelineStatusCommand)
export class CreatePipelineStatusHandler implements ICommandHandler<CreatePipelineStatusCommand, void> {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly statusRepo: PipelineStatusRepository,
  ) {}

  async execute(command: CreatePipelineStatusCommand): Promise<void> {
    const pipeline = await this.pipelineRepo.findById(command.pipelineId);
    if (!pipeline || pipeline.accountId !== command.accountId) throw new PipelineNotFoundException(command.pipelineId);

    const existingStatuses = await this.statusRepo.findByPipelineId(command.pipelineId);
    const maxSortPoints = existingStatuses.reduce((max, s) => Math.max(max, s.sortPoints), 0);

    const status = PipelineStatus.create({
      id: command.id,
      pipelineId: command.pipelineId,
      name: command.name,
      description: command.description,
      backgroundColor: command.backgroundColor,
      textColor: command.textColor,
      isTerminal: command.isTerminal,
      outcomeType: command.outcomeType,
      showInKanban: command.showInKanban,
      sortPoints: maxSortPoints + 100,
    });

    await this.statusRepo.save(status);
  }
}
