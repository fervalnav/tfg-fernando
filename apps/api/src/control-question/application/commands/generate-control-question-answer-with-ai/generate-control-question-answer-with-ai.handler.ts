import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { AiGenerationService } from '@/ai';
import { OpportunityAttachmentDocumentsService } from '@/attachment';
import { OpportunityFinder } from '@/opportunity';
import { ControlQuestionRepository } from '../../../domain/control-question.repository';
import { ControlQuestionNotFoundException } from '../../../domain/exceptions/control-question-not-found.exception';
import { GenerateControlQuestionAnswerWithAiCommand } from './generate-control-question-answer-with-ai.command';

const controlQuestionResultSchema = z.object({
  answer: z.union([z.string().trim().min(1), z.boolean()]),
  evidence: z.string().trim().min(1),
  passed: z.boolean().nullable(),
});

@CommandHandler(GenerateControlQuestionAnswerWithAiCommand)
export class GenerateControlQuestionAnswerWithAiHandler implements ICommandHandler<
  GenerateControlQuestionAnswerWithAiCommand,
  void
> {
  constructor(
    private readonly questions: ControlQuestionRepository,
    private readonly opportunityFinder: OpportunityFinder,
    private readonly ai: AiGenerationService,
    private readonly attachmentDocuments: OpportunityAttachmentDocumentsService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: GenerateControlQuestionAnswerWithAiCommand): Promise<void> {
    const question = await this.questions.findById(command.controlQuestionId);
    if (!question || question.accountId !== command.accountId || question.opportunityId !== command.opportunityId) {
      throw new ControlQuestionNotFoundException(command.controlQuestionId);
    }
    if (!question.startAiGeneration()) return;
    await this.questions.save(question);

    try {
      const [opportunity, documents] = await Promise.all([
        this.opportunityFinder.find(command.opportunityId, command.accountId),
        this.attachmentDocuments.find(command.opportunityId, command.accountId),
      ]);
      const generated = await this.ai.generateStructured({
        schema: controlQuestionResultSchema,
        schemaName: 'control_question_answer',
        system:
          'Eres un analista comercial. Responde solo con datos disponibles, explica la evidencia y no inventes información.',
        prompt: [
          `Pregunta: ${question.question}`,
          `Tipo de respuesta requerido: ${question.answerType}`,
          `Condición de aprobación: ${question.passConditionPrompt ?? 'No definida; devuelve passed como null'}`,
          `Título: ${opportunity.title}`,
          `Descripción: ${opportunity.description ?? 'No disponible'}`,
          `Importe: ${opportunity.amount ?? 'No disponible'} ${opportunity.currency ?? ''}`,
          `Fecha límite: ${opportunity.dueDate?.toISOString() ?? 'No disponible'}`,
        ].join('\n'),
        documents,
      });
      question.completeAiGeneration(generated.value.answer, generated.value.evidence, generated.value.passed);
      await this.questions.save(question);
      await this.eventBus.publishAll(question.pullDomainEvents());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al responder la pregunta';
      question.failAiGeneration(message);
      await this.questions.save(question);
      await this.eventBus.publishAll(question.pullDomainEvents());
    }
  }
}
