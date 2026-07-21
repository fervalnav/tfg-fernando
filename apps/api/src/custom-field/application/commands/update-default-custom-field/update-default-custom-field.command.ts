import { Command } from '@nestjs/cqrs';
import type { CustomFieldType } from '../../../domain/default-custom-field.entity';

export class UpdateDefaultCustomFieldCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly name: string | undefined,
    public readonly description: string | null | undefined,
    public readonly type: CustomFieldType | undefined,
    public readonly classifiers: string[] | undefined,
    public readonly canSelectMultiple: boolean | undefined,
    public readonly automatic: boolean | undefined,
    public readonly aiPrompt: string | null | undefined,
  ) {
    super();
  }
}
