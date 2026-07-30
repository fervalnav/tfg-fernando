import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { GenerateControlQuestionAnswerWithAiCommand } from '../commands/generate-control-question-answer-with-ai';
import { ControlQuestionAiGenerationRequestedEvent } from './control-question-ai.events';

@EventsHandler(ControlQuestionAiGenerationRequestedEvent)
export class ControlQuestionAiGenerationRequestedHandler implements IEventHandler<ControlQuestionAiGenerationRequestedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: ControlQuestionAiGenerationRequestedEvent): Promise<void> {
    await this.commandBus.execute(
      new GenerateControlQuestionAnswerWithAiCommand(event.opportunityId, event.accountId, event.controlQuestionId),
    );
  }
}
