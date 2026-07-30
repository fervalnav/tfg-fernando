import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { AiGenerationService } from '@/ai';
import { OpportunityAttachmentDocumentsService } from '@/attachment';
import { OpportunityFinder } from '@/opportunity';
import { CustomFieldRepository } from '../../../domain/custom-field.repository';
import { CustomFieldNotFoundException } from '../../../domain/exceptions/custom-field-not-found.exception';
import { GenerateCustomFieldValueWithAiCommand } from './generate-custom-field-value-with-ai.command';

const customFieldResultSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  evidence: z.string().trim().min(1),
});

@CommandHandler(GenerateCustomFieldValueWithAiCommand)
export class GenerateCustomFieldValueWithAiHandler implements ICommandHandler<
  GenerateCustomFieldValueWithAiCommand,
  void
> {
  constructor(
    private readonly fields: CustomFieldRepository,
    private readonly opportunityFinder: OpportunityFinder,
    private readonly ai: AiGenerationService,
    private readonly attachmentDocuments: OpportunityAttachmentDocumentsService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: GenerateCustomFieldValueWithAiCommand): Promise<void> {
    const field = await this.fields.findById(command.customFieldId);
    if (!field || field.accountId !== command.accountId || field.opportunityId !== command.opportunityId) {
      throw new CustomFieldNotFoundException(command.customFieldId);
    }
    if (!field.startAiGeneration()) return;
    await this.fields.save(field);

    try {
      const [opportunity, documents] = await Promise.all([
        this.opportunityFinder.find(command.opportunityId, command.accountId),
        this.attachmentDocuments.find(command.opportunityId, command.accountId),
      ]);
      const configuration = field.toPrimitives();
      const generated = await this.ai.generateStructured({
        schema: customFieldResultSchema,
        schemaName: 'custom_field_value',
        system:
          'Eres un analista comercial. Extrae el valor solicitado usando solo los datos disponibles y no inventes información.',
        prompt: [
          `Campo: ${configuration.name}`,
          `Descripción: ${configuration.description ?? 'No disponible'}`,
          `Instrucción: ${configuration.aiPrompt ?? ''}`,
          `Tipo esperado: ${configuration.type}`,
          `Opciones permitidas: ${configuration.classifiers.join(', ') || 'No aplica'}`,
          `Selección múltiple: ${configuration.canSelectMultiple ? 'sí' : 'no'}`,
          `Título: ${opportunity.title}`,
          `Descripción de oportunidad: ${opportunity.description ?? 'No disponible'}`,
          `Importe: ${opportunity.amount ?? 'No disponible'} ${opportunity.currency ?? ''}`,
          `Fecha límite: ${opportunity.dueDate?.toISOString() ?? 'No disponible'}`,
        ].join('\n'),
        documents,
      });
      field.completeAiGeneration(generated.value.value, generated.value.evidence);
      await this.fields.save(field);
      await this.eventBus.publishAll(field.pullDomainEvents());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al generar el campo';
      field.failAiGeneration(message);
      await this.fields.save(field);
      await this.eventBus.publishAll(field.pullDomainEvents());
    }
  }
}
