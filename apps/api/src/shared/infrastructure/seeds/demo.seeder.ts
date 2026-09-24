import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { v7 as uuidv7 } from 'uuid';
import { AccountOrmEntity } from '../../../auth/infrastructure/persistence/account.orm-entity';
import { UserOrmEntity } from '../../../auth/infrastructure/persistence/user.orm-entity';
import { PipelineOrmEntity } from '../../../pipeline/infrastructure/persistence/pipeline.orm-entity';
import { PipelineStatusOrmEntity } from '../../../pipeline/infrastructure/persistence/pipeline-status.orm-entity';
import { OpportunityOrmEntity } from '../../../opportunity/infrastructure/persistence/opportunity.orm-entity';
import { DefaultControlQuestionOrmEntity } from '../../../control-question/infrastructure/persistence/default-control-question.orm-entity';
import { ControlQuestionOrmEntity } from '../../../control-question/infrastructure/persistence/control-question.orm-entity';
import { DefaultCustomFieldOrmEntity } from '../../../custom-field/infrastructure/persistence/default-custom-field.orm-entity';
import { CustomFieldOrmEntity } from '../../../custom-field/infrastructure/persistence/custom-field.orm-entity';
import { SummaryTemplateOrmEntity } from '../../../summary/infrastructure/persistence/summary-template.orm-entity';
import { SummaryOrmEntity } from '../../../summary/infrastructure/persistence/summary.orm-entity';
import { WorkflowOrmEntity } from '../../../workflow/infrastructure/persistence/workflow.orm-entity';
import { WorkflowStepOrmEntity } from '../../../workflow/infrastructure/persistence/workflow-step.orm-entity';
import { DefaultWorkflowStepActionOrmEntity } from '../../../workflow/infrastructure/persistence/default-workflow-step-action.orm-entity';
import { WorkflowStepActionOrmEntity } from '../../../opportunity/infrastructure/persistence/workflow-step-action.orm-entity';
import { DevSeeder } from './dev.seeder';

const DEMO_WORKFLOW_NAME = 'DEMO · Documentación, cualificación y resumen con IA';

type DemoCase = {
  title: string;
  status: string;
  amount: number;
  daysUntilDue: number | null;
  dueAt?: string;
  description: string;
  outcome?: 'WON' | 'LOST' | 'DROPPED';
};

// El primer expediente procede de Tendios; los demás son casos ficticios para recorrer el pipeline.
const cases: DemoCase[] = [
  {
    title: '3038_888/2026 · Rehabilitación de la biblioteca municipal de Leitza',
    status: 'Nueva',
    amount: 289342.76,
    daysUntilDue: null,
    dueAt: '2026-10-03T21:59:00.000Z',
    description:
      'LICITACIÓN REAL CONSULTADA EN TENDIOS EL 19/09/2026. Expediente 3038_888/2026. Órgano: Alcaldía del Ayuntamiento de Leitza. Objeto: obras de la fase I de la nueva biblioteca municipal. CPV 45212330. El pliego regulador indica presupuesto de licitación sin IVA de 289.342,76 EUR, valor estimado sin IVA de 318.277,03 EUR, ejecución de 8 meses y garantía definitiva del 4% del precio de adjudicación. Tendios muestra el fin de presentación el 03/10/2026 a las 23:59. La ficha de Tendios etiqueta 318.277,03 EUR como presupuesto; aquí se usa la cifra detallada del pliego. Fuentes: https://bid.tendios.com/tender/01a0b6c8-95c0-7053-87b2-c7a41df1328e/summary y pliego regulador descargado desde su pestaña Documentos. Comprobar la fuente oficial antes de usar estos datos fuera de la demostración.',
  },
  {
    title: 'DEMO · Archivo digital municipal',
    status: 'En análisis',
    amount: 92000,
    daysUntilDue: 21,
    description:
      'CASO FICTICIO. Digitalización y clasificación de un archivo municipal. Expediente DEMO-002. Presupuesto sin IVA: 92.000 EUR. Plazo previsto: 12 meses. Equipo revisando solvencia y criterios de adjudicación. Los datos de cualificación precargados son ejemplos manuales, no resultados de IA.',
  },
  {
    title: 'DEMO · Mantenimiento de red y seguridad',
    status: 'Candidata',
    amount: 260000,
    daysUntilDue: 28,
    description:
      'CASO FICTICIO. Servicio de mantenimiento y seguridad de red para una entidad pública. Expediente DEMO-003. Evaluación interna favorable; falta preparar la oferta.',
  },
  {
    title: 'DEMO · Portal de datos abiertos',
    status: 'En preparación',
    amount: 140000,
    daysUntilDue: 15,
    description:
      'CASO FICTICIO. Desarrollo de un portal de datos abiertos. Expediente DEMO-004. Oferta técnica en preparación.',
  },
  {
    title: 'DEMO · Soporte a sedes electrónicas',
    status: 'En revisión interna',
    amount: 78000,
    daysUntilDue: 9,
    description:
      'CASO FICTICIO. Soporte y evolución de sedes electrónicas. Expediente DEMO-005. Oferta pendiente de revisión interna.',
  },
  {
    title: 'DEMO · Gestión documental corporativa',
    status: 'Presentada',
    amount: 310000,
    daysUntilDue: null,
    description:
      'CASO FICTICIO. Implantación de una solución de gestión documental. Expediente DEMO-006. Estado ilustrativo: oferta presentada; no hay justificante real de registro.',
  },
  {
    title: 'DEMO · Inventario de activos TIC',
    status: 'Ganada',
    amount: 63000,
    daysUntilDue: null,
    description:
      'CASO FICTICIO. Inventario y normalización de activos TIC. Expediente DEMO-007. Resultado ilustrativo; no representa una adjudicación real.',
    outcome: 'WON',
  },
  {
    title: 'DEMO · Centro de soporte remoto',
    status: 'Perdida',
    amount: 118000,
    daysUntilDue: null,
    description:
      'CASO FICTICIO. Centro de soporte remoto. Expediente DEMO-008. Resultado ilustrativo; no representa una licitación real.',
    outcome: 'LOST',
  },
  {
    title: 'DEMO · Formación en competencias digitales',
    status: 'Descartada',
    amount: 45000,
    daysUntilDue: null,
    description:
      'CASO FICTICIO. Formación en competencias digitales. Expediente DEMO-009. Descartada por capacidad operativa insuficiente. Este estado no aparece en el Kanban, pero sí en el listado.',
    outcome: 'DROPPED',
  },
];

export class DemoSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [DevSeeder]);

    const account = await em.findOne(AccountOrmEntity, { name: 'Nexum Licitaciones S.L.' });
    const admin = await em.findOne(UserOrmEntity, { email: 'admin@nexum.es' });
    if (!account || !admin) throw new Error('No se ha podido preparar la cuenta de demostración');

    const pipeline = await em.findOne(PipelineOrmEntity, {
      accountId: account.id,
      name: 'Pipeline de licitaciones públicas',
    });
    if (!pipeline) throw new Error('No existe el pipeline de demostración');

    const statuses = await em.find(PipelineStatusOrmEntity, { pipeline });
    const statusByName = new Map(statuses.map((status) => [status.name, status]));
    const discardedStatus = statusByName.get('Descartada');
    if (!discardedStatus) throw new Error('No existe el estado de demostración: Descartada');
    const now = new Date();
    const demoWorkflow = await this.ensureDemoWorkflow(em, account.id, pipeline.id, discardedStatus.id, now);

    for (const [index, item] of cases.entries()) {
      const existing = await em.findOne(OpportunityOrmEntity, { accountId: account.id, title: item.title });
      const status = statusByName.get(item.status);
      if (!status) throw new Error(`No existe el estado de demostración: ${item.status}`);
      const assignDemoWorkflow = index === 0 && (!existing || (!existing.workflowId && !existing.workflowStepId));

      const opportunity =
        existing ??
        new OpportunityOrmEntity({
          id: uuidv7(),
          accountId: account.id,
          title: item.title,
          description: item.description,
          amount: item.amount,
          currency: 'EUR',
          pipelineId: pipeline.id,
          pipelineStatusId: status.id,
          sortPoints: 900 - index * 100,
          workflowId: assignDemoWorkflow ? demoWorkflow.workflow.id : null,
          workflowStepId: assignDemoWorkflow ? demoWorkflow.firstStep.id : null,
          organizationId: null,
          dueDate: item.dueAt
            ? new Date(item.dueAt)
            : item.daysUntilDue === null
              ? null
              : new Date(now.getTime() + item.daysUntilDue * 86400000),
          finalOutcomeType: item.outcome ?? null,
          closedAt: item.outcome ? now : null,
          responsibleUserIds: [admin.id],
          responsibleTeamIds: [],
          createdAt: now,
          updatedAt: now,
        });
      if (!existing) em.persist(opportunity);

      if (
        index === 0 &&
        existing &&
        existing.workflowId === demoWorkflow.workflow.id &&
        existing.workflowStepId === demoWorkflow.decisionStep.id &&
        existing.finalOutcomeType === null &&
        existing.pipelineStatusId !== discardedStatus.id
      ) {
        existing.workflowStepId = demoWorkflow.qualificationStep.id;
        existing.updatedAt = now;
      }
      if (existing && existing.pipelineStatusId === discardedStatus.id && existing.finalOutcomeType === null) {
        existing.finalOutcomeType = 'DROPPED';
        existing.closedAt = now;
        existing.updatedAt = now;
      }

      if (assignDemoWorkflow) {
        if (existing) {
          existing.workflowId = demoWorkflow.workflow.id;
          existing.workflowStepId = demoWorkflow.firstStep.id;
          existing.updatedAt = now;
        }
        await em.flush();
        for (const defaultAction of demoWorkflow.firstStepActions) {
          const runtimeAction = await em.findOne(WorkflowStepActionOrmEntity, {
            opportunityId: opportunity.id,
            defaultWorkflowStepActionId: defaultAction.id,
          });
          if (runtimeAction) continue;
          em.persist(
            new WorkflowStepActionOrmEntity({
              id: uuidv7(),
              accountId: account.id,
              opportunityId: opportunity.id,
              workflowStepId: demoWorkflow.firstStep.id,
              defaultWorkflowStepActionId: defaultAction.id,
              name: defaultAction.name,
              targetType: defaultAction.targetType,
              targetId: null,
              metadata: defaultAction.metadata,
              position: defaultAction.position,
              status: 'PENDING',
              errorMessage: null,
              completedAt: null,
              createdAt: now,
              updatedAt: now,
            }),
          );
        }
      }

      if (item.status === 'En análisis') {
        if (!existing) await em.flush();
        await this.seedQualification(em, account.id, opportunity.id, now);
      }
    }

    await em.flush();
  }

  private async ensureDemoWorkflow(
    em: EntityManager,
    accountId: string,
    pipelineId: string,
    discardedStatusId: string,
    now: Date,
  ): Promise<{
    workflow: WorkflowOrmEntity;
    firstStep: WorkflowStepOrmEntity;
    qualificationStep: WorkflowStepOrmEntity;
    decisionStep: WorkflowStepOrmEntity;
    firstStepActions: DefaultWorkflowStepActionOrmEntity[];
  }> {
    const template = await em.findOne(SummaryTemplateOrmEntity, { accountId, name: 'Análisis de viabilidad' });
    if (!template) throw new Error('Falta la plantilla de análisis de viabilidad para el workflow de demostración');
    const question = (await em.find(DefaultControlQuestionOrmEntity, { accountId })).find((item) =>
      item.question.startsWith('¿Cumplimos los requisitos de solvencia económica'),
    );
    if (!question) throw new Error('Falta la pregunta de solvencia para el workflow de demostración');
    const ensField = (await em.find(DefaultCustomFieldOrmEntity, { accountId })).find(
      (item) => item.name === 'Certificación ENS requerida',
    );
    if (!ensField) throw new Error('Falta el campo de certificación ENS para el workflow de demostración');
    const uteField = (await em.find(DefaultCustomFieldOrmEntity, { accountId })).find(
      (item) => item.name === 'Admite UTE',
    );
    if (!uteField) throw new Error('Falta el campo de UTE para el workflow de demostración');

    const existing = await em.findOne(WorkflowOrmEntity, { accountId, name: DEMO_WORKFLOW_NAME });
    if (existing) {
      const steps = (await em.find(WorkflowStepOrmEntity, { workflow: existing })).sort(
        (left, right) => left.position - right.position,
      );
      const firstStep = steps.find((step) => step.position === 1);
      if (!firstStep) throw new Error('El workflow de demostración no tiene primer paso');
      let decisionStep = steps.find((step) => step.name === 'Filtro ENS');
      if (!decisionStep) {
        for (const step of steps.filter((step) => step.position >= 3)) step.position += 1;
        decisionStep = new WorkflowStepOrmEntity({
          id: uuidv7(),
          workflow: existing,
          name: 'Filtro ENS',
          type: 'decision',
          condition: '¿La licitación requiere un certificado ENS de cualquier categoría distinta de «No requerida»?',
          position: 3,
          createdAt: now,
          updatedAt: now,
        });
        em.persist(decisionStep);
      }
      const qualificationStep = steps.find((step) => step.name === 'Cualificación inicial');
      if (!qualificationStep) throw new Error('El workflow de demostración no tiene paso de cualificación');
      qualificationStep.position = 2;
      decisionStep.position = 3;
      const summaryStep = steps.find((step) => step.name === 'Resumen de solvencia y viabilidad');
      if (!summaryStep) throw new Error('El workflow de demostración no tiene paso de resumen');
      const decisionActions = await em.find(DefaultWorkflowStepActionOrmEntity, { step: decisionStep });
      if (!decisionActions.some((action) => action.name === 'Descartar si exige certificación ENS')) {
        em.persist(
          new DefaultWorkflowStepActionOrmEntity({
            id: uuidv7(),
            step: decisionStep,
            name: 'Descartar si exige certificación ENS',
            targetType: 'opportunity_status_update',
            targetId: discardedStatusId,
            metadata: { pipelineId, finalOutcomeType: 'DROPPED' },
            position: 1,
            createdAt: now,
            updatedAt: now,
          }),
        );
      }

      existing.updatedAt = now;
      const firstStepActions = await em.find(DefaultWorkflowStepActionOrmEntity, { step: firstStep });
      return { workflow: existing, firstStep, qualificationStep, decisionStep, firstStepActions };
    }

    const workflow = new WorkflowOrmEntity({
      id: uuidv7(),
      accountId,
      name: DEMO_WORKFLOW_NAME,
      description: 'Dos pliegos y una única generación de IA para mostrar el flujo completo con coste controlado.',
      createdAt: now,
      updatedAt: now,
    });
    em.persist(workflow);
    const firstStep = new WorkflowStepOrmEntity({
      id: uuidv7(),
      workflow,
      name: 'Adjuntar pliegos',
      type: 'step',
      condition: null,
      position: 1,
      createdAt: now,
      updatedAt: now,
    });
    const qualificationStep = new WorkflowStepOrmEntity({
      id: uuidv7(),
      workflow,
      name: 'Cualificación inicial',
      type: 'step',
      condition: null,
      position: 2,
      createdAt: now,
      updatedAt: now,
    });
    const ensDecisionStep = new WorkflowStepOrmEntity({
      id: uuidv7(),
      workflow,
      name: 'Filtro ENS',
      type: 'decision',
      condition: '¿La licitación requiere un certificado ENS de cualquier categoría distinta de «No requerida»?',
      position: 3,
      createdAt: now,
      updatedAt: now,
    });
    const summaryStep = new WorkflowStepOrmEntity({
      id: uuidv7(),
      workflow,
      name: 'Resumen de solvencia y viabilidad',
      type: 'step',
      condition: null,
      position: 4,
      createdAt: now,
      updatedAt: now,
    });
    em.persist(firstStep);
    em.persist(ensDecisionStep);
    em.persist(qualificationStep);
    em.persist(summaryStep);

    const firstStepActions = [
      { name: 'Adjuntar PCAP (pliego administrativo)', label: 'PCAP' },
      { name: 'Adjuntar PPTP (pliego técnico)', label: 'PPTP' },
    ].map((action, index) => {
      const defaultAction = new DefaultWorkflowStepActionOrmEntity({
        id: uuidv7(),
        step: firstStep,
        name: action.name,
        targetType: 'attachment',
        targetId: null,
        metadata: { label: action.label },
        position: index + 1,
        createdAt: now,
        updatedAt: now,
      });
      em.persist(defaultAction);
      return defaultAction;
    });
    em.persist(
      new DefaultWorkflowStepActionOrmEntity({
        id: uuidv7(),
        step: ensDecisionStep,
        name: 'Descartar si exige certificación ENS',
        targetType: 'opportunity_status_update',
        targetId: discardedStatusId,
        metadata: { pipelineId, finalOutcomeType: 'DROPPED' },
        position: 1,
        createdAt: now,
        updatedAt: now,
      }),
    );
    em.persist(
      new DefaultWorkflowStepActionOrmEntity({
        id: uuidv7(),
        step: qualificationStep,
        name: 'Comprobar solvencia económica',
        targetType: 'control_question',
        targetId: question.id,
        metadata: null,
        position: 1,
        createdAt: now,
        updatedAt: now,
      }),
    );
    em.persist(
      new DefaultWorkflowStepActionOrmEntity({
        id: uuidv7(),
        step: qualificationStep,
        name: 'Comprobar certificación ENS y categoría',
        targetType: 'custom_field',
        targetId: ensField.id,
        metadata: null,
        position: 2,
        createdAt: now,
        updatedAt: now,
      }),
    );
    em.persist(
      new DefaultWorkflowStepActionOrmEntity({
        id: uuidv7(),
        step: qualificationStep,
        name: 'Comprobar si admite UTE',
        targetType: 'custom_field',
        targetId: uteField.id,
        metadata: null,
        position: 2,
        createdAt: now,
        updatedAt: now,
      }),
    );
    em.persist(
      new DefaultWorkflowStepActionOrmEntity({
        id: uuidv7(),
        step: summaryStep,
        name: 'Analizar solvencia y criterios de participación',
        targetType: 'summary',
        targetId: template.id,
        metadata: null,
        position: 1,
        createdAt: now,
        updatedAt: now,
      }),
    );

    await em.flush();
    return { workflow, firstStep, qualificationStep, decisionStep: ensDecisionStep, firstStepActions };
  }

  private async seedQualification(
    em: EntityManager,
    accountId: string,
    opportunityId: string,
    now: Date,
  ): Promise<void> {
    const questions = await em.find(DefaultControlQuestionOrmEntity, { accountId });
    const question = questions.find((item) =>
      item.question.startsWith('¿Cumplimos los requisitos de solvencia económica'),
    );
    if (!question) throw new Error('Falta la pregunta de solvencia para la demo');
    const existingQuestion = await em.findOne(ControlQuestionOrmEntity, {
      accountId,
      opportunityId,
      defaultControlQuestionId: question.id,
    });
    if (!existingQuestion)
      em.persist(
        new ControlQuestionOrmEntity({
          id: uuidv7(),
          accountId,
          opportunityId,
          defaultControlQuestionId: question.id,
          question: question.question,
          answerType: question.answerType,
          passConditionPrompt: question.passConditionPrompt,
          answer: true,
          aiStatus: 'IDLE',
          aiError: null,
          aiEvidence: null,
          aiPassed: null,
          aiGeneratedAt: null,
          createdAt: now,
          updatedAt: now,
        }),
      );

    const fields = await em.find(DefaultCustomFieldOrmEntity, { accountId });
    for (const [name, value] of [
      ['Número de expediente', 'DEMO-002'],
      ['Presupuesto base sin IVA (€)', 92000],
      ['Tipo de contrato', 'Servicios'],
    ] as const) {
      const template = fields.find((item) => item.name === name);
      if (!template) throw new Error(`Falta el campo ${name} para la demo`);
      const existingField = await em.findOne(CustomFieldOrmEntity, {
        accountId,
        opportunityId,
        defaultCustomFieldId: template.id,
      });
      if (existingField) continue;
      em.persist(
        new CustomFieldOrmEntity({
          id: uuidv7(),
          accountId,
          opportunityId,
          defaultCustomFieldId: template.id,
          name: template.name,
          description: template.description,
          type: template.type,
          classifiers: template.classifiers,
          canSelectMultiple: template.canSelectMultiple,
          automatic: template.automatic,
          aiPrompt: template.aiPrompt,
          value,
          aiStatus: 'IDLE',
          aiError: null,
          aiEvidence: null,
          aiGeneratedAt: null,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }

    const template = await em.findOne(SummaryTemplateOrmEntity, { accountId, name: 'Resumen ejecutivo' });
    if (!template) throw new Error('Falta la plantilla de resumen ejecutivo para la demo');
    const existingSummary = await em.findOne(SummaryOrmEntity, {
      accountId,
      opportunityId,
      summaryTemplateId: template.id,
    });
    if (!existingSummary)
      em.persist(
        new SummaryOrmEntity({
          id: uuidv7(),
          accountId,
          opportunityId,
          summaryTemplateId: template.id,
          name: template.name,
          prompt: template.prompt,
          result:
            'EJEMPLO FICTICIO INTRODUCIDO MANUALMENTE. Servicio de digitalización de archivo municipal por 92.000 EUR sin IVA y 12 meses de ejecución. Revisar los pliegos antes de tomar una decisión de participación.',
          generationStatus: 'IDLE',
          generationError: null,
          generatedAt: null,
          createdAt: now,
          updatedAt: now,
        }),
      );
  }
}
