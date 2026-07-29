import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityQualificationUpdatedEvent } from '@/opportunity';
import { ControlQuestionRepository } from '../../../domain/control-question.repository';
import { ControlQuestionNotFoundException } from '../../../domain/exceptions/control-question-not-found.exception';
import { AnswerControlQuestionCommand } from './answer-control-question.command';

@CommandHandler(AnswerControlQuestionCommand)
export class AnswerControlQuestionHandler implements ICommandHandler<AnswerControlQuestionCommand, void> {
  constructor(
    private readonly instances: ControlQuestionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AnswerControlQuestionCommand): Promise<void> {
    const instance = await this.instances.findById(command.controlQuestionId);
    if (!instance || instance.accountId !== command.accountId || instance.opportunityId !== command.opportunityId) {
      throw new ControlQuestionNotFoundException(command.controlQuestionId);
    }
    instance.answer(command.answer);
    await this.instances.save(instance);
    this.eventBus.publish(
      new OpportunityQualificationUpdatedEvent(
        command.opportunityId,
        command.accountId,
        'control_question',
        instance.id,
      ),
    );
  }
}
