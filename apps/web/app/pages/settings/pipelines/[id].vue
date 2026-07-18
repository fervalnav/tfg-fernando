<script setup lang="ts">
import { toast } from 'vue-sonner';
import { PipelineStatusList, PipelineStatusDialog, usePipelineQuery, useUpdatePipelineMutation } from '~/modules/pipeline';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const route = useRoute();
const id = computed(() => route.params['id'] as string);

const { data: pipeline, isLoading } = usePipelineQuery(id);
const { mutate: updatePipeline } = useUpdatePipelineMutation();

const isEditingName = ref(false);
const editedName = ref('');

function startEdit() {
  editedName.value = pipeline.value?.name ?? '';
  isEditingName.value = true;
}

function saveName() {
  if (!editedName.value.trim() || !pipeline.value) return;
  updatePipeline(
    { id: pipeline.value.id, name: editedName.value.trim() },
    {
      onSuccess: () => { toast.success('Pipeline actualizado'); isEditingName.value = false; },
      onError: () => toast.error('Error al actualizar el pipeline'),
    },
  );
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="mb-2">
      <NuxtLink to="/settings/pipelines" class="text-sm text-muted-foreground hover:text-foreground">
        ← Volver a pipelines
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div class="h-8 w-48 rounded bg-muted animate-pulse" />
      <div class="h-48 rounded-xl bg-muted animate-pulse" />
    </div>

    <template v-else-if="pipeline">
      <div class="flex items-center gap-3 mb-6">
        <template v-if="isEditingName">
          <input
            v-model="editedName"
            class="text-xl font-semibold bg-transparent border-b border-primary outline-none flex-1"
            autofocus
            @keydown.enter="saveName"
            @keydown.escape="isEditingName = false"
          />
          <Button size="sm" @click="saveName">Guardar</Button>
          <Button size="sm" variant="ghost" @click="isEditingName = false">Cancelar</Button>
        </template>
        <template v-else>
          <h2 class="text-xl font-semibold">{{ pipeline.name }}</h2>
          <Button size="sm" variant="ghost" class="text-muted-foreground" @click="startEdit">Renombrar</Button>
        </template>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estados</h3>
          <PipelineStatusDialog :pipeline-id="pipeline.id" />
        </div>

        <PipelineStatusList
          v-if="pipeline.statuses.length"
          :pipeline-id="pipeline.id"
          :statuses="pipeline.statuses"
        />
        <p v-else class="text-sm text-muted-foreground text-center py-8">
          Sin estados. Añade el primero.
        </p>
      </div>
    </template>
  </div>
</template>
