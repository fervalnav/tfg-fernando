<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { WorkflowDto } from '@tfg/types';
import {
  WorkflowCard,
  WorkflowCreateDialog,
  useWorkflowsInfiniteQuery,
  useDeleteWorkflowMutation,
  useDuplicateWorkflowMutation,
} from '~/modules/workflow';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useWorkflowsInfiniteQuery();
const items = computed(() => data.value?.pages.flatMap((p) => p.items) ?? []);
const total = computed(() => data.value?.pages[0]?.total ?? 0);

const { mutate: deleteWorkflow } = useDeleteWorkflowMutation();
const { mutate: duplicateWorkflow } = useDuplicateWorkflowMutation();

const isDialogOpen = ref(false);
const editingWorkflow = ref<WorkflowDto | null>(null);

function openCreate() {
  editingWorkflow.value = null;
  isDialogOpen.value = true;
}

function openEdit(workflow: WorkflowDto) {
  editingWorkflow.value = workflow;
  isDialogOpen.value = true;
}

function handleDelete(id: string) {
  deleteWorkflow(id, {
    onSuccess: () => toast.success('Workflow eliminado'),
    onError: () => toast.error('Error al eliminar'),
  });
}

function handleDuplicate(id: string) {
  duplicateWorkflow(id, {
    onSuccess: () => toast.success('Workflow duplicado'),
    onError: () => toast.error('Error al duplicar'),
  });
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Workflows</h2>
        <p class="text-sm text-muted-foreground mt-1">
          {{ isLoading ? 'Cargando...' : `${total} workflow${total === 1 ? '' : 's'}` }}
        </p>
      </div>
      <Button @click="openCreate">Nuevo workflow</Button>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-14 rounded-lg bg-muted animate-pulse" />
    </div>

    <div v-else-if="!items.length" class="text-center py-16 text-muted-foreground text-sm">
      Sin workflows. Crea el primero para configurar tus procesos.
    </div>

    <div v-else class="space-y-2">
      <WorkflowCard
        v-for="workflow in items"
        :key="workflow.id"
        :workflow="workflow"
        @edit="openEdit"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
      />
      <div v-if="hasNextPage" class="pt-2">
        <Button variant="outline" size="sm" class="w-full" :disabled="isFetchingNextPage" @click="fetchNextPage()">
          {{ isFetchingNextPage ? 'Cargando...' : 'Cargar más' }}
        </Button>
      </div>
    </div>

    <WorkflowCreateDialog :open="isDialogOpen" :editing="editingWorkflow" @update:open="isDialogOpen = $event" />
  </div>
</template>
