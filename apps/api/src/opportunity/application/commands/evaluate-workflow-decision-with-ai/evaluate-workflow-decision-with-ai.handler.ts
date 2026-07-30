import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { AiGenerationService } from '@/ai';
import { OpportunityAttachmentDocumentsService } from '@/attachment';
import { ControlQuestionRepository } from '@/control-question';
import { CustomFieldRepository } from '@/custom-field';
import { SummaryRepository } from '@/summary';
import { WorkflowStepRepository } from '@/workflow';
import { WorkflowDecisionResultRepository } from '../../../domain/workflow-decision-result.repository';
import { OpportunityWorkflowConflictException } from '../../../domain/exceptions/opportunity-workflow-conflict.exception';
import { OpportunityFinder } from '../../services/opportunity.finder';
import { EvaluateWorkflowDecisionWithAiCommand } from './evaluate-workflow-decision-with-ai.command';

const workflowDecisionSchema = z.object({
  result: z.boolean(),
  evidence: z.string().trim().min(1),
});

@CommandHandler(EvaluateWorkflowDecisionWithAiCommand)
export class EvaluateWorkflowDecisionWithAiHandler implements ICommandHandler<
  EvaluateWorkflowDecisionWithAiCommand,
  void
> {
  constructor(
    private readonly decisions: WorkflowDecisionResultRepository,
    private readonly steps: WorkflowStepRepository,
    private readonly opportunityFinder: OpportunityFinder,
    private readonly controlQuestions: ControlQuestionRepository,
    private readonly customFields: CustomFieldRepository,
    private readonly summaries: SummaryRepository,
    private readonly ai: AiGenerationService,
    private readonly attachmentDocuments: OpportunityAttachmentDocumentsService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: EvaluateWorkflowDecisionWithAiCommand): Promise<void> {
    const [opportunity, step, decision, controlQuestions, customFields, summaries, documents] = await Promise.all([
      this.opportunityFinder.find(command.opportunityId, command.accountId),
      this.steps.findById(command.workflowStepId),
      this.decisions.findByOpportunityAndStep(command.opportunityId, command.workflowStepId),
      this.controlQuestions.findByOpportunityId(command.opportunityId, command.accountId),
      this.customFields.findByOpportunityId(command.opportunityId, command.accountId),
      this.summaries.findByOpportunityId(command.opportunityId, command.accountId),
      this.attachmentDocuments.find(command.opportunityId, command.accountId),
    ]);
    if (opportunity.workflowStepId !== command.workflowStepId || !step || step.type !== 'decision' || !decision) {
      throw new OpportunityWorkflowConflictException('La decisión solicitada no está activa');
    }

    try {
      const generated = await this.ai.generateStructured({
        schema: workflowDecisionSchema,
        schemaName: 'workflow_decision',
        system:
          'Eres un analista comercial. Evalúa la condición únicamente con los datos proporcionados, no inventes información y justifica la decisión.',
        prompt: [
          `Paso: ${step.name}`,
          `Condición: ${step.condition ?? 'No definida'}`,
          `Título: ${opportunity.title}`,
          `Descripción: ${opportunity.description ?? 'No disponible'}`,
          `Importe: ${opportunity.amount ?? 'No disponible'} ${opportunity.currency ?? ''}`,
          `Fecha límite: ${opportunity.dueDate?.toISOString() ?? 'No disponible'}`,
          `Preguntas de control: ${JSON.stringify(
            controlQuestions.map((question) => ({
              question: question.question,
              answer: question.answerValue,
              evidence: question.toPrimitives().aiEvidence,
            })),
          )}`,
          `Campos personalizados: ${JSON.stringify(
            customFields.map((field) => ({
              name: field.toPrimitives().name,
              value: field.value,
              evidence: field.toPrimitives().aiEvidence,
            })),
          )}`,
          `Resúmenes: ${JSON.stringify(
            summaries.map((summary) => ({
              name: summary.toPrimitives().name,
              result: summary.toPrimitives().result,
            })),
          )}`,
        ].join('\n'),
        documents,
      });
      decision.resolve(generated.value.result ? 'TRUE' : 'FALSE', generated.value.evidence);
    } catch (error) {
      decision.resolve('ERROR', error instanceof Error ? error.message : 'Error inesperado al evaluar la decisión');
    }
    await this.decisions.save(decision);
    await this.eventBus.publishAll(decision.pullDomainEvents());
  }
}
