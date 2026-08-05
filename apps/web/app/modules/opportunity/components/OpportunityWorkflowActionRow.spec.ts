import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionTargetType, DefaultWorkflowStepActionDto, WorkflowStepActionDto } from '@tfg/types';
import OpportunityWorkflowActionRow from './OpportunityWorkflowActionRow.vue';

const { mutateMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('../composables/api/useOpportunityWorkflowMutations', () => ({
  useWorkflowActionMutation: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock('vue-sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}));

describe('OpportunityWorkflowActionRow', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it('expands a pending manual action and allows completing or skipping it', async () => {
    const wrapper = mountRow('task', action('PENDING'));

    await wrapper.get('button').trigger('click');

    expect(wrapper.text()).toContain('Pendiente');
    expect(wrapper.text()).toContain('Tipo de acción');
    expect(wrapper.text()).toContain('Omitir');
    expect(wrapper.text()).toContain('Completar');

    await buttonByText(wrapper, 'Completar').trigger('click');
    expect(mutateMock).toHaveBeenCalledWith(
      { opportunityId: 'opportunity-id', actionId: 'runtime-action-id', operation: 'complete' },
      expect.any(Object),
    );
  });

  it('shows a failed state and exposes retry without manual completion', async () => {
    const wrapper = mountRow('summary', action('FAILED', 'Proveedor no disponible'));

    await wrapper.get('button').trigger('click');

    expect(wrapper.text()).toContain('Con error');
    expect(wrapper.text()).toContain('Proveedor no disponible');
    expect(wrapper.text()).toContain('Reintentar');
    expect(wrapper.text()).not.toContain('Completar');

    await buttonByText(wrapper, 'Reintentar').trigger('click');
    expect(mutateMock).toHaveBeenCalledWith(
      { opportunityId: 'opportunity-id', actionId: 'runtime-action-id', operation: 'retry' },
      expect.any(Object),
    );
  });

  it('allows skipping attachment actions but never completing them manually', async () => {
    const wrapper = mountRow('attachment', action('PENDING'));

    await wrapper.get('button').trigger('click');

    expect(wrapper.text()).toContain('Omitir');
    expect(wrapper.text()).not.toContain('Completar');
  });

  it('renders future-step actions as blocked and without mutation controls', async () => {
    const wrapper = mountRow('task', undefined, false);

    await wrapper.get('button').trigger('click');

    expect(wrapper.text()).toContain('Bloqueada');
    expect(wrapper.text()).toContain('Acción todavía no disponible');
    expect(wrapper.text()).not.toContain('Omitir');
  });
});

function mountRow(targetType: ActionTargetType, runtimeAction?: WorkflowStepActionDto, isCurrentStep = true) {
  return shallowMount(OpportunityWorkflowActionRow, {
    props: {
      definition: definition(targetType),
      action: runtimeAction,
      isCurrentStep,
      opportunityId: 'opportunity-id',
    },
    global: {
      stubs: {
        Badge: { template: '<span><slot /></span>' },
        Button: { template: '<button type="button"><slot /></button>' },
      },
    },
  });
}

function definition(targetType: ActionTargetType): DefaultWorkflowStepActionDto {
  return {
    id: 'definition-id',
    workflowStepId: 'step-id',
    name: 'Acción de prueba',
    targetType,
    targetId: null,
    metadata: null,
    position: 1,
  };
}

function action(status: WorkflowStepActionDto['status'], errorMessage: string | null = null): WorkflowStepActionDto {
  return {
    id: 'runtime-action-id',
    opportunityId: 'opportunity-id',
    workflowStepId: 'step-id',
    defaultWorkflowStepActionId: 'definition-id',
    name: 'Acción de prueba',
    targetType: 'task',
    targetId: null,
    metadata: null,
    position: 1,
    status,
    errorMessage,
    completedAt: null,
    createdAt: '2026-08-04T10:00:00.000Z',
    updatedAt: '2026-08-04T10:00:00.000Z',
  };
}

function buttonByText(wrapper: ReturnType<typeof mountRow>, text: string) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text().includes(text));
  if (!button) throw new Error(`Button not found: ${text}`);
  return button;
}
