import { Command } from '@nestjs/cqrs';
import type { OutcomeType } from '../../../domain/value-objects/outcome-type.vo';

export class CreatePipelineStatusCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly pipelineId: string,
    public readonly accountId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly backgroundColor: string | null,
    public readonly textColor: string | null,
    public readonly isTerminal: boolean,
    public readonly outcomeType: OutcomeType,
    public readonly showInKanban: boolean,
  ) {
    super();
  }
}
