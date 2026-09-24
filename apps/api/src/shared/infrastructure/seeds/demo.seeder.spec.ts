import type { EntityManager } from '@mikro-orm/core';
import { AccountOrmEntity } from '../../../auth/infrastructure/persistence/account.orm-entity';
import { UserOrmEntity } from '../../../auth/infrastructure/persistence/user.orm-entity';
import { PipelineOrmEntity } from '../../../pipeline/infrastructure/persistence/pipeline.orm-entity';
import { PipelineStatusOrmEntity } from '../../../pipeline/infrastructure/persistence/pipeline-status.orm-entity';
import { DefaultControlQuestionOrmEntity } from '../../../control-question/infrastructure/persistence/default-control-question.orm-entity';
import { DefaultCustomFieldOrmEntity } from '../../../custom-field/infrastructure/persistence/default-custom-field.orm-entity';
import { SummaryTemplateOrmEntity } from '../../../summary/infrastructure/persistence/summary-template.orm-entity';
import { WorkflowOrmEntity } from '../../../workflow/infrastructure/persistence/workflow.orm-entity';
import { WorkflowStepOrmEntity } from '../../../workflow/infrastructure/persistence/workflow-step.orm-entity';
import { DefaultWorkflowStepActionOrmEntity } from '../../../workflow/infrastructure/persistence/default-workflow-step-action.orm-entity';
import { OpportunityOrmEntity } from '../../../opportunity/infrastructure/persistence/opportunity.orm-entity';
import { WorkflowStepActionOrmEntity } from '../../../opportunity/infrastructure/persistence/workflow-step-action.orm-entity';
import { DemoSeeder } from './demo.seeder';
import { DevSeeder } from './dev.seeder';

describe('DemoSeeder', () => {
  it('seeds an idempotent documentary workflow with one example of each AI action', async () => {
    const account = Object.assign(Object.create(AccountOrmEntity.prototype) as AccountOrmEntity, {
      id: 'account-id',
      name: 'Nexum Licitaciones S.L.',
    });
    const admin = Object.assign(Object.create(UserOrmEntity.prototype) as UserOrmEntity, {
      id: 'admin-id',
      email: 'admin@nexum.es',
    });
    const pipeline = Object.assign(Object.create(PipelineOrmEntity.prototype) as PipelineOrmEntity, {
      id: 'pipeline-id',
      accountId: account.id,
      name: 'Pipeline de licitaciones públicas',
    });
    const statuses = [
      'Nueva',
      'En análisis',
      'Candidata',
      'En preparación',
      'En revisión interna',
      'Presentada',
      'Ganada',
      'Perdida',
      'Descartada',
    ].map((name) =>
      Object.assign(Object.create(PipelineStatusOrmEntity.prototype) as PipelineStatusOrmEntity, {
        id: name,
        name,
        pipeline,
      }),
    );
    const question = Object.assign(
      Object.create(DefaultControlQuestionOrmEntity.prototype) as DefaultControlQuestionOrmEntity,
      {
        id: 'question-id',
        accountId: account.id,
        question: '¿Cumplimos los requisitos de solvencia económica y financiera exigidos?',
        answerType: 'BOOLEAN',
        passConditionPrompt: null,
      },
    );
    const fields = [
      'Número de expediente',
      'Presupuesto base sin IVA (€)',
      'Certificación ENS requerida',
      'Admite UTE',
      'Tipo de contrato',
    ].map((name) =>
      Object.assign(Object.create(DefaultCustomFieldOrmEntity.prototype) as DefaultCustomFieldOrmEntity, {
        id: name,
        accountId: account.id,
        name,
        description: null,
        type: 'TEXT',
        classifiers: [],
        canSelectMultiple: false,
        automatic: false,
        aiPrompt: null,
      }),
    );
    const template = Object.assign(Object.create(SummaryTemplateOrmEntity.prototype) as SummaryTemplateOrmEntity, {
      id: 'summary-template-id',
      accountId: account.id,
      name: 'Resumen ejecutivo',
      prompt: 'Resume la licitación',
    });
    const viabilityTemplate = Object.assign(
      Object.create(SummaryTemplateOrmEntity.prototype) as SummaryTemplateOrmEntity,
      {
        id: 'viability-template-id',
        accountId: account.id,
        name: 'Análisis de viabilidad',
        prompt: 'Analiza solvencia y viabilidad',
      },
    );
    const persisted: object[] = [
      account,
      admin,
      pipeline,
      ...statuses,
      question,
      ...fields,
      template,
      viabilityTemplate,
    ];
    const em = {
      fork: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
      persist: jest.fn((entity: object) => {
        persisted.push(entity);
      }),
      find: jest.fn((entity: new (...args: never[]) => object, filter: Record<string, unknown>) =>
        Promise.resolve(
          persisted.filter(
            (candidate) =>
              candidate instanceof entity &&
              Object.entries(filter).every(([key, value]) => (candidate as Record<string, unknown>)[key] === value),
          ),
        ),
      ),
      findOne: jest.fn((entity: new (...args: never[]) => object, filter: Record<string, unknown>) =>
        Promise.resolve(
          persisted.find(
            (candidate) =>
              candidate instanceof entity &&
              Object.entries(filter).every(([key, value]) => (candidate as Record<string, unknown>)[key] === value),
          ) ?? null,
        ),
      ),
    };
    em.fork.mockReturnValue(em);
    jest.spyOn(DevSeeder.prototype, 'run').mockResolvedValue(undefined);

    try {
      const seeder = new DemoSeeder();
      await seeder.run(em as unknown as EntityManager);
      await seeder.run(em as unknown as EntityManager);

      const workflows = persisted.filter((entity): entity is WorkflowOrmEntity => entity instanceof WorkflowOrmEntity);
      const steps = persisted.filter(
        (entity): entity is WorkflowStepOrmEntity => entity instanceof WorkflowStepOrmEntity,
      );
      const defaults = persisted.filter(
        (entity): entity is DefaultWorkflowStepActionOrmEntity => entity instanceof DefaultWorkflowStepActionOrmEntity,
      );
      const runtime = persisted.filter(
        (entity): entity is WorkflowStepActionOrmEntity => entity instanceof WorkflowStepActionOrmEntity,
      );
      const tender = persisted.find(
        (entity): entity is OpportunityOrmEntity =>
          entity instanceof OpportunityOrmEntity && entity.title.startsWith('3038_888/2026'),
      );

      expect(workflows).toHaveLength(1);
      expect(steps).toHaveLength(4);
      expect(defaults.filter((action) => action.targetType === 'attachment')).toHaveLength(2);
      expect(defaults.filter((action) => action.targetType === 'summary')).toHaveLength(1);
      expect(defaults.filter((action) => action.targetType === 'email_notification')).toHaveLength(1);
      expect(defaults.filter((action) => action.targetType === 'opportunity_status_update')).toHaveLength(1);
      expect(steps.find((step) => step.name === 'Filtro ENS')).toMatchObject({ type: 'decision', position: 3 });
      expect(defaults.find((action) => action.targetType === 'opportunity_status_update')).toMatchObject({
        targetId: 'Descartada',
        metadata: { pipelineId: pipeline.id },
      });
      expect(
        defaults.filter((action) => action.targetType === 'control_question' || action.targetType === 'custom_field'),
      ).toHaveLength(3);
      expect(runtime).toHaveLength(2);
      expect(runtime.every((action) => action.targetType === 'attachment' && action.status === 'PENDING')).toBe(true);
      expect(tender).toMatchObject({ workflowId: workflows[0]?.id, workflowStepId: steps[0]?.id });
    } finally {
      jest.restoreAllMocks();
    }
  });
});
