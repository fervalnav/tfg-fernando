import { Command } from '@nestjs/cqrs';
import type { OutcomeType } from '../../../domain/value-objects/outcome-type.vo';

export class UpdatePipelineStatusCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly pipelineId: string,
    public readonly accountId: string,
    public readonly name: string | undefined,
    public readonly description: string | null | undefined,
    public readonly backgroundColor: string | null | undefined,
    public readonly textColor: string | null | undefined,
    public readonly isTerminal: boolean | undefined,
    public readonly outcomeType: OutcomeType | undefined,
    public readonly showInKanban: boolean | undefined,
  ) {
    super();
  }
}
