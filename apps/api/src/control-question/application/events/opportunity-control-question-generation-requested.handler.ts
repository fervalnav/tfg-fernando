import { CommandBus, EventBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { OpportunityQualificationGenerationRequestedEvent } from '@/opportunity';
import { ControlQuestionRepository } from '../../domain/control-question.repository';
import { RequestControlQuestionAiGenerationCommand } from '../commands/request-control-question-ai-generation';

@EventsHandler(OpportunityQualificationGenerationRequestedEvent)
export class OpportunityControlQuestionGenerationRequestedHandler implements IEventHandler<OpportunityQualificationGenerationRequestedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly questions: ControlQuestionRepository,
  ) {}

  async handle(event: OpportunityQualificationGenerationRequestedEvent): Promise<void> {
    if (event.targetType !== 'control_question') return;
    try {
      await this.commandBus.execute(
        new RequestControlQuestionAiGenerationCommand(event.opportunityId, event.accountId, event.targetId),
      );
    } catch (error) {
      const question = await this.questions.findById(event.targetId);
      if (!question || question.accountId !== event.accountId || question.opportunityId !== event.opportunityId) return;
      question.failAiGeneration(error instanceof Error ? error.message : 'No se pudo solicitar la generación');
      await this.questions.save(question);
      await this.eventBus.publishAll(question.pullDomainEvents());
    }
  }
}
