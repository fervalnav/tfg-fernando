import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { AiGenerationService } from '@/ai';
import { OpportunityAttachmentDocumentsService } from '@/attachment';
import { OpportunityFinder } from '@/opportunity';
import { SummaryRepository } from '../../../domain/summary.repository';
import { SummaryNotFoundException } from '../../../domain/exceptions/summary-not-found.exception';
import { GenerateSummaryWithAiCommand } from './generate-summary-with-ai.command';

const summaryResultSchema = z.object({ result: z.string().trim().min(1) });

@CommandHandler(GenerateSummaryWithAiCommand)
export class GenerateSummaryWithAiHandler implements ICommandHandler<GenerateSummaryWithAiCommand, void> {
  constructor(
    private readonly summaries: SummaryRepository,
    private readonly opportunityFinder: OpportunityFinder,
    private readonly ai: AiGenerationService,
    private readonly attachmentDocuments: OpportunityAttachmentDocumentsService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: GenerateSummaryWithAiCommand): Promise<void> {
    const summary = await this.summaries.findById(command.summaryId);
    if (!summary || summary.accountId !== command.accountId || summary.opportunityId !== command.opportunityId) {
      throw new SummaryNotFoundException(command.summaryId);
    }
    if (!summary.startAiGeneration()) return;
    await this.summaries.save(summary);

    try {
      const [opportunity, documents] = await Promise.all([
        this.opportunityFinder.find(command.opportunityId, command.accountId),
        this.attachmentDocuments.find(command.opportunityId, command.accountId),
      ]);
      const generated = await this.ai.generateStructured({
        schema: summaryResultSchema,
        schemaName: 'opportunity_summary',
        system:
          'Eres un analista comercial. Resume solo los datos proporcionados, no inventes información y responde en español.',
        prompt: [
          `Instrucción del resumen: ${summary.toPrimitives().prompt}`,
          `Título: ${opportunity.title}`,
          `Descripción: ${opportunity.description ?? 'No disponible'}`,
          `Importe: ${opportunity.amount ?? 'No disponible'} ${opportunity.currency ?? ''}`,
          `Fecha límite: ${opportunity.dueDate?.toISOString() ?? 'No disponible'}`,
        ].join('\n'),
        documents,
      });
      summary.completeAiGeneration(generated.value.result);
      await this.summaries.save(summary);
      await this.eventBus.publishAll(summary.pullDomainEvents());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al generar el resumen';
      summary.failAiGeneration(message);
      await this.summaries.save(summary);
      await this.eventBus.publishAll(summary.pullDomainEvents());
    }
  }
}
