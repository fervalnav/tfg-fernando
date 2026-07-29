import { Command } from '@nestjs/cqrs';
import type { CustomFieldValue } from '@tfg/types';

export class SetCustomFieldValueCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly customFieldId: string,
    public readonly value: Exclude<CustomFieldValue, null>,
  ) {
    super();
  }
}
