import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { WorkflowDto } from '@tfg/types';
import WorkflowCard from './WorkflowCard.vue';

describe('WorkflowCard', () => {
  it('renders workflow information and its detail destination', () => {
    const wrapper = mountCard();

    expect(wrapper.text()).toContain('Evaluación de licitación');
    expect(wrapper.text()).toContain('3 pasos');
    expect(wrapper.text()).toContain('Analiza la viabilidad');
    expect(wrapper.get('[data-test="nuxt-link"]').attributes('to')).toBe('/settings/workflows/workflow-id');
  });

  it('emits edit, duplicate and delete actions with the expected identifiers', async () => {
    const wrapper = mountCard();

    await buttonByText(wrapper, 'Editar').trigger('click');
    await buttonByText(wrapper, 'Duplicar').trigger('click');
    await buttonByText(wrapper, 'Eliminar').trigger('click');

    expect(wrapper.emitted('edit')).toEqual([[workflow()]]);
    expect(wrapper.emitted('duplicate')).toEqual([['workflow-id']]);
    expect(wrapper.emitted('delete')).toEqual([['workflow-id']]);
  });
});

function mountCard() {
  return shallowMount(WorkflowCard, {
    props: { workflow: workflow() },
    global: {
      stubs: {
        Button: { template: '<button type="button"><slot /></button>' },
        NuxtLink: { props: ['to'], template: '<a data-test="nuxt-link" :to="to"><slot /></a>' },
        DropdownMenu: { template: '<div><slot /></div>' },
        DropdownMenuTrigger: { template: '<div><slot /></div>' },
        DropdownMenuContent: { template: '<div><slot /></div>' },
        DropdownMenuItem: { template: '<button type="button"><slot /></button>' },
        DropdownMenuSeparator: true,
        MoreHorizontalIcon: true,
        PencilIcon: true,
        CopyIcon: true,
        Trash2Icon: true,
        ArrowRightIcon: true,
      },
    },
  });
}

function workflow(): WorkflowDto {
  return {
    id: 'workflow-id',
    accountId: 'account-id',
    name: 'Evaluación de licitación',
    description: 'Analiza la viabilidad',
    stepsCount: 3,
    createdAt: '2026-08-05T10:00:00.000Z',
  };
}

function buttonByText(wrapper: ReturnType<typeof mountCard>, text: string) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text().includes(text));
  if (!button) throw new Error(`Button not found: ${text}`);
  return button;
}
