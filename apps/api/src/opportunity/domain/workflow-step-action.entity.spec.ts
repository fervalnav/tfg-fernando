import { WorkflowStepAction } from './workflow-step-action.entity';

describe('WorkflowStepAction', () => {
  function createAction(): WorkflowStepAction {
    return WorkflowStepAction.create({
      id: '019fa500-0000-7000-8000-000000000001',
      accountId: '019fa500-0000-7000-8000-000000000002',
      opportunityId: '019fa500-0000-7000-8000-000000000003',
      workflowStepId: '019fa500-0000-7000-8000-000000000004',
      defaultWorkflowStepActionId: '019fa500-0000-7000-8000-000000000005',
      name: 'Action',
      targetType: 'task',
      targetId: null,
      metadata: null,
      position: 1,
    });
  }

  it.each(['COMPLETED', 'SKIPPED'] as const)('treats %s as settled', (status) => {
    const action = createAction();
    if (status === 'COMPLETED') action.complete();
    else action.skip();
    expect(action.status).toBe(status);
    expect(action.isSettled).toBe(true);
  });

  it('allows failed actions to be retried', () => {
    const action = createAction();
    action.fail('Failure');
    action.retry();
    expect(action.status).toBe('PENDING');
    expect(action.toPrimitives().errorMessage).toBeNull();
  });
});
