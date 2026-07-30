import { Command } from '@nestjs/cqrs';

export class GenerateCustomFieldValueWithAiCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly customFieldId: string,
  ) {
    super();
  }
}
