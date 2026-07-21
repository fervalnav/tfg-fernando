import { Command } from '@nestjs/cqrs';

export class DeleteDefaultControlQuestionCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
