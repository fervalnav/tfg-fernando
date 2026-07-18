import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReorderPipelineStatusesCommand } from './reorder-pipeline-statuses.command';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';

@CommandHandler(ReorderPipelineStatusesCommand)
export class ReorderPipelineStatusesHandler implements ICommandHandler<ReorderPipelineStatusesCommand, void> {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly statusRepo: PipelineStatusRepository,
  ) {}

  async execute(command: ReorderPipelineStatusesCommand): Promise<void> {
    const pipeline = await this.pipelineRepo.findById(command.pipelineId);
    if (!pipeline || pipeline.accountId !== command.accountId) throw new PipelineNotFoundException(command.pipelineId);

    const statuses = await this.statusRepo.findByPipelineId(command.pipelineId);
    const statusMap = new Map(statuses.map((s) => [s.id, s]));

    const reordered = command.ids
      .map((id) => statusMap.get(id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);

    reordered.forEach((status, i) => status.setSortPoints((i + 1) * 100));
    await this.statusRepo.saveMany(reordered);
  }
}
