import { Command } from '@nestjs/cqrs';
import type { CustomFieldType } from '../../../domain/default-custom-field.entity';

export class CreateDefaultCustomFieldCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly type: CustomFieldType,
    public readonly classifiers: string[],
    public readonly canSelectMultiple: boolean,
    public readonly automatic: boolean,
    public readonly aiPrompt: string | null,
  ) {
    super();
  }
}
