import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { ControlQuestionRepository } from '../../../domain/control-question.repository';
import { ControlQuestionNotFoundException } from '../../../domain/exceptions/control-question-not-found.exception';
import { ControlQuestionAiGenerationRequestedEvent } from '../../events/control-question-ai.events';
import { RequestControlQuestionAiGenerationCommand } from './request-control-question-ai-generation.command';

@CommandHandler(RequestControlQuestionAiGenerationCommand)
export class RequestControlQuestionAiGenerationHandler implements ICommandHandler<
  RequestControlQuestionAiGenerationCommand,
  void
> {
  constructor(
    private readonly questions: ControlQuestionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RequestControlQuestionAiGenerationCommand): Promise<void> {
    const question = await this.questions.findById(command.controlQuestionId);
    if (!question || question.accountId !== command.accountId || question.opportunityId !== command.opportunityId) {
      throw new ControlQuestionNotFoundException(command.controlQuestionId);
    }
    if (!question.requestAiGeneration()) return;
    await this.questions.save(question);
    this.eventBus.publish(
      new ControlQuestionAiGenerationRequestedEvent(
        command.opportunityId,
        command.accountId,
        command.controlQuestionId,
      ),
    );
  }
}
