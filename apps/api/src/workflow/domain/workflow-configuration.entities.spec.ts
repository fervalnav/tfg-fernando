import { DefaultWorkflowStepAction } from './default-workflow-step-action.entity';
import { WorkflowStep } from './workflow-step.entity';
import { Workflow } from './workflow.entity';

describe('workflow configuration entities', () => {
  it('updates workflow metadata while preserving ownership', () => {
    const workflow = Workflow.create({
      id: 'workflow-id',
      accountId: 'account-id',
      name: 'Inicial',
      description: 'Descripción',
    });

    workflow.update('Licitaciones', null);

    expect(workflow.toPrimitives()).toMatchObject({
      id: 'workflow-id',
      accountId: 'account-id',
      name: 'Licitaciones',
      description: null,
    });
  });

  it('updates a step from normal execution to a decision', () => {
    const step = WorkflowStep.create({
      id: 'step-id',
      workflowId: 'workflow-id',
      name: 'Analizar',
      type: 'step',
      position: 1,
    });

    step.update('Decidir', 'decision', '¿Nos presentamos?', 2);

    expect(step.toPrimitives()).toMatchObject({
      workflowId: 'workflow-id',
      name: 'Decidir',
      type: 'decision',
      condition: '¿Nos presentamos?',
      position: 2,
    });
  });

  it('updates action target, metadata and position without changing its step', () => {
    const action = DefaultWorkflowStepAction.create({
      id: 'action-id',
      workflowStepId: 'step-id',
      name: 'Adjuntar anuncio',
      targetType: 'attachment',
      position: 1,
    });

    action.update('Generar resumen', 'summary', 'summary-template-id', { required: true }, 3);

    expect(action.toPrimitives()).toMatchObject({
      id: 'action-id',
      workflowStepId: 'step-id',
      name: 'Generar resumen',
      targetType: 'summary',
      targetId: 'summary-template-id',
      metadata: { required: true },
      position: 3,
    });
  });
});
