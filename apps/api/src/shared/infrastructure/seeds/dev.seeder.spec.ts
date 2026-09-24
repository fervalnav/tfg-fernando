import type { EntityManager } from '@mikro-orm/core';
import { UserOrmEntity } from '../../../auth/infrastructure/persistence/user.orm-entity';
import { DefaultControlQuestionOrmEntity } from '../../../control-question/infrastructure/persistence/default-control-question.orm-entity';
import { DefaultCustomFieldOrmEntity } from '../../../custom-field/infrastructure/persistence/default-custom-field.orm-entity';
import { SummaryTemplateOrmEntity } from '../../../summary/infrastructure/persistence/summary-template.orm-entity';
import { DefaultWorkflowStepActionOrmEntity } from '../../../workflow/infrastructure/persistence/default-workflow-step-action.orm-entity';
import { WorkflowOrmEntity } from '../../../workflow/infrastructure/persistence/workflow.orm-entity';
import { WorkflowStepOrmEntity } from '../../../workflow/infrastructure/persistence/workflow-step.orm-entity';
import { AccountOrmEntity } from '../../../auth/infrastructure/persistence/account.orm-entity';
import { OpportunityOrmEntity } from '../../../opportunity/infrastructure/persistence/opportunity.orm-entity';
import { WorkflowStepActionOrmEntity } from '../../../opportunity/infrastructure/persistence/workflow-step-action.orm-entity';
import { PipelineStatusOrmEntity } from '../../../pipeline/infrastructure/persistence/pipeline-status.orm-entity';
import { DevSeeder } from './dev.seeder';

describe('DevSeeder', () => {
  it('creates coherent workflows with document-only first steps and linked qualification actions', async () => {
    const persisted: object[] = [];
    const flush = jest.fn().mockResolvedValue(undefined);
    const em = {
      findOne: jest.fn().mockResolvedValue(null),
      persist: jest.fn((entity: object) => {
        persisted.push(entity);
        return em;
      }),
      find: jest.fn().mockImplementation(() => persisted.filter((entity) => entity instanceof PipelineStatusOrmEntity)),
      flush,
    } as unknown as EntityManager;

    await new DevSeeder().run(em, { demo: true });

    expect(persisted.some((entity) => entity instanceof AccountOrmEntity && entity.name === 'Tendios')).toBe(true);
    expect(persisted.some((entity) => entity instanceof UserOrmEntity && entity.email === 'fernando@tendios.com')).toBe(
      true,
    );

    const workflows = persisted.filter((entity): entity is WorkflowOrmEntity => entity instanceof WorkflowOrmEntity);
    const steps = persisted.filter(
      (entity): entity is WorkflowStepOrmEntity => entity instanceof WorkflowStepOrmEntity,
    );
    const actions = persisted.filter(
      (entity): entity is DefaultWorkflowStepActionOrmEntity => entity instanceof DefaultWorkflowStepActionOrmEntity,
    );
    expect(workflows).toHaveLength(4);

    const opportunity = persisted.find(
      (entity): entity is OpportunityOrmEntity => entity instanceof OpportunityOrmEntity,
    );
    expect(opportunity).toMatchObject({
      title: '2026-P2-12 - Acceso y musealización de las Galerías Punta Begoña',
      amount: 104289.62,
      currency: 'EUR',
    });
    expect(opportunity?.description).toContain('memoria técnica 49 puntos');
    const runtimeActions = persisted.filter(
      (entity): entity is WorkflowStepActionOrmEntity => entity instanceof WorkflowStepActionOrmEntity,
    );
    expect(runtimeActions).toHaveLength(2);
    expect(runtimeActions.every((action) => action.targetType === 'attachment' && action.status === 'PENDING')).toBe(
      true,
    );
    expect(flush).toHaveBeenCalledTimes(3);

    const standardWorkflow = workflows.find((workflow) => workflow.name === 'Proceso estándar de licitación');
    expect(standardWorkflow).toBeDefined();
    const standardFirstStep = steps
      .filter((step) => step.workflow.id === standardWorkflow?.id)
      .sort((left, right) => left.position - right.position)[0];
    const standardFirstStepActions = actions.filter((action) => action.step.id === standardFirstStep?.id);
    expect(standardFirstStepActions.length).toBeGreaterThan(0);
    expect(standardFirstStepActions.every((action) => action.targetType === 'attachment')).toBe(true);
    expect(workflows.some((workflow) => workflow.name === 'Demo directo · Filtro de certificación ENS')).toBe(true);
    expect(workflows.some((workflow) => workflow.name === 'Demo directo · Análisis rápido con IA')).toBe(true);

    const validTargets = {
      control_question: new Set(
        persisted
          .filter(
            (entity): entity is DefaultControlQuestionOrmEntity => entity instanceof DefaultControlQuestionOrmEntity,
          )
          .map((entity) => entity.id),
      ),
      custom_field: new Set(
        persisted
          .filter((entity): entity is DefaultCustomFieldOrmEntity => entity instanceof DefaultCustomFieldOrmEntity)
          .map((entity) => entity.id),
      ),
      summary: new Set(
        persisted
          .filter((entity): entity is SummaryTemplateOrmEntity => entity instanceof SummaryTemplateOrmEntity)
          .map((entity) => entity.id),
      ),
    };
    const qualificationActions = actions.filter(
      (action) =>
        action.targetType === 'control_question' ||
        action.targetType === 'custom_field' ||
        action.targetType === 'summary',
    );
    expect(qualificationActions.length).toBeGreaterThan(0);
    for (const action of qualificationActions) {
      if (
        action.targetType !== 'control_question' &&
        action.targetType !== 'custom_field' &&
        action.targetType !== 'summary'
      ) {
        throw new Error('Unexpected action type');
      }
      expect(action.targetId).not.toBeNull();
      expect(validTargets[action.targetType].has(action.targetId ?? '')).toBe(true);
    }
  });

  it('does not duplicate the seed when the admin user already exists', async () => {
    const persist = jest.fn();
    const flush = jest.fn();
    const em = {
      findOne: jest.fn().mockResolvedValue({ id: 'existing-admin' }),
      persist,
      flush,
    } as unknown as EntityManager;

    await new DevSeeder().run(em);

    expect(persist).not.toHaveBeenCalled();
    expect(flush).not.toHaveBeenCalled();
  });
});
