import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityQualificationActionLifecycleService } from '@/opportunity';
import { ControlQuestionRepository } from '../../../domain/control-question.repository';
import { ControlQuestionNotFoundException } from '../../../domain/exceptions/control-question-not-found.exception';
import { RequestControlQuestionAiGenerationCommand } from './request-control-question-ai-generation.command';

@CommandHandler(RequestControlQuestionAiGenerationCommand)
export class RequestControlQuestionAiGenerationHandler implements ICommandHandler<
  RequestControlQuestionAiGenerationCommand,
  void
> {
  constructor(
    private readonly questions: ControlQuestionRepository,
    private readonly eventBus: EventBus,
    private readonly actionLifecycle: OpportunityQualificationActionLifecycleService,
  ) {}

  async execute(command: RequestControlQuestionAiGenerationCommand): Promise<void> {
    const question = await this.questions.findById(command.controlQuestionId);
    if (!question || question.accountId !== command.accountId || question.opportunityId !== command.opportunityId) {
      throw new ControlQuestionNotFoundException(command.controlQuestionId);
    }
    if (!question.requestAiGeneration()) return;
    await this.questions.save(question);
    await this.actionLifecycle.start(
      command.opportunityId,
      command.accountId,
      'control_question',
      command.controlQuestionId,
    );
    await this.eventBus.publishAll(question.pullDomainEvents());
  }
}
