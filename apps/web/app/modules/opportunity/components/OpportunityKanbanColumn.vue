<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';
import { VueDraggable } from 'vue-draggable-plus';
import type { SortableEvent } from 'vue-draggable-plus';
import type { OpportunityDto, PipelineStatusDto } from '@tfg/types';
import OpportunityCard from './OpportunityCard.vue';
import { calculateSortPoints } from '../composables/useSortPoints';

const props = defineProps<{
  status: PipelineStatusDto;
  opportunities: OpportunityDto[];
  totalAmount: number;
}>();

const emit = defineEmits<{
  add: [statusId: string];
  drop: [
    event: {
      opportunityId: string;
      fromStatusId: string;
      toStatusId: string;
      newIndex: number;
      newSortPoints: number | null; // null when cross-column: parent computes from server data
    },
  ];
}>();

const localItems = ref<OpportunityDto[]>([...props.opportunities]);

watch(
  () => props.opportunities,
  (items) => {
    localItems.value = [...items];
  },
);

const formattedTotal = computed(() => {
  if (!props.totalAmount) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(props.totalAmount);
});

function handleDragEnd(event: SortableEvent) {
  const { newIndex, item, from, to } = event;
  if (newIndex == null) return;

  const fromStatusId = (from as HTMLElement).dataset['statusId'] ?? '';
  const toStatusId = (to as HTMLElement).dataset['statusId'] ?? '';
  // Read id from the dragged DOM element — localItems[newIndex] is wrong for cross-column drags
  // because VueDraggable removes the item from the source list before @end fires.
  const opportunityId = (item as HTMLElement).dataset['opportunityId'];
  if (!opportunityId) return;

  const isSameColumn = fromStatusId === toStatusId;
  // Same-column: localItems already has the item at newIndex (VueDraggable reordered it).
  // Cross-column: localItems is the SOURCE list (item removed); parent computes sortPoints.
  const newSortPoints = isSameColumn ? calculateSortPoints(localItems.value, newIndex) : null;
  emit('drop', { opportunityId, fromStatusId, toStatusId, newIndex, newSortPoints });
}
</script>

<template>
  <div class="flex flex-col w-72 shrink-0 rounded-lg bg-muted/40 border border-border/50">
    <!-- Header -->
    <div class="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
      <span class="size-2.5 rounded-full shrink-0" :style="{ backgroundColor: status.backgroundColor ?? '#94a3b8' }" />
      <span class="text-sm font-medium flex-1 truncate">{{ status.name }}</span>
      <span class="text-xs text-muted-foreground tabular-nums">{{ opportunities.length }}</span>
      <span v-if="formattedTotal" class="text-xs text-muted-foreground ml-1">{{ formattedTotal }}</span>
    </div>

    <!-- Draggable list: vue-draggable-plus renders items via v-for in default slot -->
    <VueDraggable
      v-model="localItems"
      group="kanban"
      :data-status-id="status.id"
      class="flex flex-col gap-2 p-2 flex-1 min-h-16 overflow-y-auto max-h-[calc(100vh-220px)]"
      @end="handleDragEnd"
    >
      <div v-for="item in localItems" :key="item.id" :data-opportunity-id="item.id">
        <OpportunityCard :opportunity="item" />
      </div>
    </VueDraggable>

    <!-- Add button -->
    <button
      class="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors rounded-b-lg"
      @click="emit('add', status.id)"
    >
      <PlusIcon class="size-3.5" />
      Añadir oportunidad
    </button>
  </div>
</template>
