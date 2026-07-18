<script setup lang="ts">
import type { PipelineStatusDto } from '@tfg/types';
import { toast } from 'vue-sonner';
import { ChevronUpIcon, ChevronDownIcon, MoreHorizontalIcon, ArrowRightFromLineIcon, PencilIcon, Trash2Icon } from 'lucide-vue-next';
import { useDeletePipelineStatusMutation } from '../composables/api/useDeletePipelineStatusMutation';
import { useReorderPipelineStatusesMutation } from '../composables/api/useReorderPipelineStatusesMutation';
import { useSetInitialPipelineStatusMutation } from '../composables/api/useSetInitialPipelineStatusMutation';
import PipelineStatusDialog from './PipelineStatusDialog.vue';

const props = defineProps<{ pipelineId: string; statuses: PipelineStatusDto[] }>();

const { mutate: deleteStatus } = useDeletePipelineStatusMutation();
const { mutate: reorder } = useReorderPipelineStatusesMutation();
const { mutate: setInitial } = useSetInitialPipelineStatusMutation();

const isEditOpen = ref(false);
const editingStatus = ref<PipelineStatusDto | null>(null);

function openEdit(status: PipelineStatusDto) {
  editingStatus.value = status;
  isEditOpen.value = true;
}

function handleDelete(statusId: string) {
  deleteStatus(
    { pipelineId: props.pipelineId, statusId },
    {
      onSuccess: () => toast.success('Estado eliminado'),
      onError: () => toast.error('Error al eliminar el estado'),
    },
  );
}

function move(index: number, direction: -1 | 1) {
  const newStatuses = [...props.statuses];
  const swapIndex = index + direction;
  if (swapIndex < 0 || swapIndex >= newStatuses.length) return;
  [newStatuses[index], newStatuses[swapIndex]] = [newStatuses[swapIndex]!, newStatuses[index]!];
  reorder(
    { pipelineId: props.pipelineId, ids: newStatuses.map((s) => s.id) },
    { onError: () => toast.error('Error al reordenar los estados') },
  );
}

function handleSetInitial(statusId: string) {
  setInitial(
    { pipelineId: props.pipelineId, statusId },
    {
      onSuccess: () => toast.success('Estado inicial actualizado'),
      onError: () => toast.error('Error al cambiar el estado inicial'),
    },
  );
}

const OUTCOME_LABELS: Record<string, string> = {
  NONE: '',
  WON: 'Ganada',
  LOST: 'Perdida',
  DROPPED: 'Descartada',
};
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(status, i) in statuses"
      :key="status.id"
      class="flex items-center gap-3 rounded-lg border bg-card p-3"
    >
      <div
        class="size-4 shrink-0 rounded-full border"
        :style="status.backgroundColor ? { backgroundColor: status.backgroundColor } : { backgroundColor: '#e2e8f0' }"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium truncate">{{ status.name }}</span>
          <Badge v-if="status.isInitial" class="text-xs shrink-0 bg-primary/10 text-primary border-primary/20">Inicial</Badge>
          <Badge v-if="status.isTerminal && status.outcomeType !== 'NONE'" variant="outline" class="text-xs shrink-0">
            {{ OUTCOME_LABELS[status.outcomeType] }}
          </Badge>
          <Badge v-if="!status.showInKanban" variant="outline" class="text-xs shrink-0 text-muted-foreground">
            Oculto en Kanban
          </Badge>
        </div>
        <p v-if="status.description" class="text-xs text-muted-foreground truncate">{{ status.description }}</p>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <Button size="icon" variant="ghost" class="size-7" :disabled="i === 0" @click="move(i, -1)">
          <ChevronUpIcon class="size-4" />
        </Button>
        <Button size="icon" variant="ghost" class="size-7" :disabled="i === statuses.length - 1" @click="move(i, 1)">
          <ChevronDownIcon class="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button size="icon" variant="ghost" class="size-7">
              <MoreHorizontalIcon class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem v-if="!status.isInitial && !status.isTerminal" @click="handleSetInitial(status.id)">
              <ArrowRightFromLineIcon class="mr-2 size-4" />
              Marcar como inicial
            </DropdownMenuItem>
            <DropdownMenuItem @click="openEdit(status)">
              <PencilIcon class="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive focus:text-destructive" @click="handleDelete(status.id)">
              <Trash2Icon class="mr-2 size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>

  <!-- Dialog de edición controlado externamente -->
  <PipelineStatusDialog
    v-model:open="isEditOpen"
    :pipeline-id="pipelineId"
    :status="editingStatus ?? undefined"
  />
</template>
