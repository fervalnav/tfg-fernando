import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { GenerateSummaryWithAiCommand } from '../commands/generate-summary-with-ai';
import { SummaryAiGenerationRequestedEvent } from './summary-ai.events';

@EventsHandler(SummaryAiGenerationRequestedEvent)
export class SummaryAiGenerationRequestedHandler implements IEventHandler<SummaryAiGenerationRequestedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: SummaryAiGenerationRequestedEvent): Promise<void> {
    await this.commandBus.execute(
      new GenerateSummaryWithAiCommand(event.opportunityId, event.accountId, event.summaryId),
    );
  }
}
