import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PipelineDto } from '@tfg/types';
import PipelineCard from './PipelineCard.vue';

const { mutateMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('../composables/api/useDeletePipelineMutation', () => ({
  useDeletePipelineMutation: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock('vue-sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}));

describe('PipelineCard', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it('renders the pipeline statuses and its edit destination', () => {
    const wrapper = mountCard();

    expect(wrapper.text()).toContain('Pipeline de ventas');
    expect(wrapper.text()).toContain('En análisis');
    expect(wrapper.text()).toContain('1 estados');
    expect(wrapper.get('[data-test="nuxt-link"]').attributes('to')).toBe('/settings/pipelines/pipeline-id');
  });

  it('requests deletion and reports both possible outcomes', async () => {
    const wrapper = mountCard();

    await buttonByText(wrapper, 'Eliminar').trigger('click');

    expect(mutateMock).toHaveBeenCalledWith('pipeline-id', expect.any(Object));
    const callbacks = mutateMock.mock.calls[0]?.[1] as { onSuccess: () => void; onError: () => void };
    callbacks.onSuccess();
    callbacks.onError();
    expect(toastSuccessMock).toHaveBeenCalledWith('Pipeline eliminado');
    expect(toastErrorMock).toHaveBeenCalledWith('Error al eliminar el pipeline');
  });
});

function mountCard() {
  return shallowMount(PipelineCard, {
    props: { pipeline: pipeline() },
    global: {
      stubs: {
        Card: { template: '<article><slot /></article>' },
        CardHeader: { template: '<header><slot /></header>' },
        CardTitle: { template: '<h2><slot /></h2>' },
        CardContent: { template: '<section><slot /></section>' },
        Badge: { template: '<span><slot /></span>' },
        Button: { template: '<button type="button"><slot /></button>' },
        NuxtLink: { props: ['to'], template: '<a data-test="nuxt-link" :to="to"><slot /></a>' },
      },
    },
  });
}

function pipeline(): PipelineDto {
  return {
    id: 'pipeline-id',
    name: 'Pipeline de ventas',
    createdAt: '2026-08-05T10:00:00.000Z',
    statuses: [
      {
        id: 'status-id',
        pipelineId: 'pipeline-id',
        name: 'En análisis',
        description: null,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        isInitial: true,
        isTerminal: false,
        outcomeType: 'NONE',
        showInKanban: true,
        sortPoints: 100,
        createdAt: '2026-08-05T10:00:00.000Z',
        updatedAt: '2026-08-05T10:00:00.000Z',
      },
    ],
  };
}

function buttonByText(wrapper: ReturnType<typeof mountCard>, text: string) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text().includes(text));
  if (!button) throw new Error(`Button not found: ${text}`);
  return button;
}
