<script setup lang="ts">
import { toast } from 'vue-sonner';
import { useQueryClient } from '@tanstack/vue-query';
import type { OpportunityFilters, PipelineDto } from '@tfg/types';
import OpportunityKanbanColumn from './OpportunityKanbanColumn.vue';
import OpportunityCreateDialog from './OpportunityCreateDialog.vue';
import { useKanbanOpportunitiesQuery } from '../composables/api/useKanbanOpportunitiesQuery';
import { usePipelineStatusTotalsQuery } from '../composables/api/usePipelineStatusTotalsQuery';
import { useTransitionStatusMutation } from '../composables/api/useTransitionStatusMutation';
import { useUpdatePositionMutation } from '../composables/api/useUpdatePositionMutation';

const props = defineProps<{
  pipeline: PipelineDto;
  filters: OpportunityFilters;
}>();

const queryClient = useQueryClient();
const pipelineId = computed(() => props.pipeline.id);
const filters = computed(() => props.filters);

const { data: kanbanItems, isLoading, isError, refetch } = useKanbanOpportunitiesQuery(pipelineId, filters);
const { data: totals } = usePipelineStatusTotalsQuery(pipelineId, filters);
const { mutate: transitionStatus } = useTransitionStatusMutation();
const { mutate: updatePosition } = useUpdatePositionMutation();

const isCreateOpen = ref(false);
const createStatusId = ref('');

const kanbanStatuses = computed(() =>
  props.pipeline.statuses.filter((s) => s.showInKanban).sort((a, b) => a.sortPoints - b.sortPoints),
);

const opportunitiesByStatus = computed(() => {
  const items = kanbanItems.value ?? [];
  return Object.fromEntries(
    kanbanStatuses.value.map((s) => [
      s.id,
      items.filter((o) => o.pipelineStatusId === s.id).sort((a, b) => a.sortPoints - b.sortPoints),
    ]),
  );
});

const totalByStatus = computed(() => Object.fromEntries((totals.value ?? []).map((t) => [t.statusId, t.totalAmount])));

function openCreateDialog(statusId: string) {
  createStatusId.value = statusId;
  isCreateOpen.value = true;
}

function computeCrossColumnSortPoints(toStatusId: string, newIndex: number): number {
  const destItems = opportunitiesByStatus.value[toStatusId] ?? [];
  // Server data doesn't include the dragged item yet; newIndex is its position in the destination.
  // predecessor = item before the new slot, successor = item that will be after it.
  const predecessor = destItems[newIndex - 1];
  const successor = destItems[newIndex];
  if (!predecessor && !successor) return 1000;
  if (!predecessor) return (successor?.sortPoints ?? 2000) - 1000;
  if (!successor) return predecessor.sortPoints + 1000;
  return (predecessor.sortPoints + successor.sortPoints) / 2;
}

function handleDrop(event: {
  opportunityId: string;
  fromStatusId: string;
  toStatusId: string;
  newIndex: number;
  newSortPoints: number | null;
}) {
  const { opportunityId, fromStatusId, toStatusId, newIndex, newSortPoints } = event;
  const resolvedSortPoints = newSortPoints ?? computeCrossColumnSortPoints(toStatusId, newIndex);

  if (fromStatusId !== toStatusId) {
    const targetStatus = props.pipeline.statuses.find((s) => s.id === toStatusId);
    transitionStatus(
      {
        id: opportunityId,
        pipelineStatusId: toStatusId,
        finalOutcomeType: targetStatus?.isTerminal
          ? (targetStatus.outcomeType as 'WON' | 'LOST' | 'DROPPED')
          : undefined,
        sortPoints: resolvedSortPoints,
      },
      {
        onError: () => {
          toast.error('Error al mover la oportunidad');
          void queryClient.invalidateQueries({ queryKey: ['opportunities', 'kanban', pipelineId.value] });
        },
      },
    );
  } else {
    updatePosition(
      { id: opportunityId, sortPoints: resolvedSortPoints },
      {
        onError: () => {
          toast.error('Error al reordenar');
          void queryClient.invalidateQueries({ queryKey: ['opportunities', 'kanban', pipelineId.value] });
        },
      },
    );
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 items-stretch gap-4 overflow-x-auto overflow-y-hidden px-4 py-4">
    <template v-if="isLoading">
      <div v-for="i in 4" :key="i" class="w-72 shrink-0 h-48 rounded-lg bg-muted animate-pulse" />
    </template>

    <QueryErrorState
      v-else-if="isError"
      class="w-full self-start"
      message="No se pudo cargar el kanban."
      @retry="refetch()"
    />

    <template v-else>
      <OpportunityKanbanColumn
        v-for="status in kanbanStatuses"
        :key="status.id"
        :status="status"
        :opportunities="opportunitiesByStatus[status.id] ?? []"
        :total-amount="totalByStatus[status.id] ?? 0"
        @add="openCreateDialog"
        @drop="handleDrop"
      />
    </template>
  </div>

  <OpportunityCreateDialog
    v-model:open="isCreateOpen"
    :pipeline-id="pipeline.id"
    :pipeline-status-id="createStatusId"
  />
</template>
