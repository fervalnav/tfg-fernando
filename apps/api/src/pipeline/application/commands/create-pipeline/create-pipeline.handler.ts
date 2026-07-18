import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePipelineCommand } from './create-pipeline.command';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { Pipeline } from '../../../domain/pipeline.entity';
import { PipelineStatus } from '../../../domain/pipeline-status.entity';
import { IdService } from '@/shared/domain/services/id.service';

const DEFAULT_STATUSES: {
  name: string;
  isInitial?: boolean;
  isTerminal?: boolean;
  outcomeType?: 'NONE' | 'WON' | 'LOST' | 'DROPPED';
  showInKanban?: boolean;
}[] = [
  { name: 'En análisis', isInitial: true, outcomeType: 'NONE', showInKanban: true },
  { name: 'Candidata', outcomeType: 'NONE', showInKanban: true },
  { name: 'En preparación', outcomeType: 'NONE', showInKanban: true },
  { name: 'Presentada', outcomeType: 'NONE', showInKanban: true },
  { name: 'Ganada', isTerminal: true, outcomeType: 'WON', showInKanban: true },
  { name: 'Perdida', isTerminal: true, outcomeType: 'LOST', showInKanban: true },
  { name: 'Descartada', isTerminal: true, outcomeType: 'DROPPED', showInKanban: false },
];

@CommandHandler(CreatePipelineCommand)
export class CreatePipelineHandler implements ICommandHandler<CreatePipelineCommand, void> {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly statusRepo: PipelineStatusRepository,
    private readonly idService: IdService,
  ) {}

  async execute(command: CreatePipelineCommand): Promise<void> {
    const pipeline = Pipeline.create({ id: command.id, accountId: command.accountId, name: command.name });
    await this.pipelineRepo.save(pipeline);

    const statuses = DEFAULT_STATUSES.map((s, i) =>
      PipelineStatus.create({
        id: this.idService.generate(),
        pipelineId: pipeline.id,
        name: s.name,
        isInitial: s.isInitial,
        isTerminal: s.isTerminal,
        outcomeType: s.outcomeType,
        showInKanban: s.showInKanban,
        sortPoints: (i + 1) * 100,
      }),
    );

    for (const status of statuses) {
      await this.statusRepo.save(status);
    }
  }
}
