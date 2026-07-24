<script setup lang="ts">
import { ArrowLeftIcon } from 'lucide-vue-next';
import { WorkflowStepList, WorkflowActionSheet, useWorkflowQuery } from '~/modules/workflow';
import { provideWorkflowEditorContext } from '~/modules/workflow/composables/useWorkflowEditorContext';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const route = useRoute();
const id = computed(() => route.params['id'] as string);

const { data: workflow, isLoading } = useWorkflowQuery(id);

const steps = computed(() => workflow.value?.steps ?? []);
provideWorkflowEditorContext(id, steps);
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="mb-6">
      <NuxtLink
        to="/settings/workflows"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeftIcon class="size-4" /> Volver a workflows
      </NuxtLink>
      <div v-if="isLoading" class="h-7 w-48 rounded bg-muted animate-pulse" />
      <template v-else-if="workflow">
        <h2 class="text-xl font-semibold">{{ workflow.name }}</h2>
        <p v-if="workflow.description" class="text-sm text-muted-foreground mt-1">{{ workflow.description }}</p>
      </template>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 rounded-lg bg-muted animate-pulse" />
    </div>

    <div v-else-if="!workflow" class="text-center py-16 text-muted-foreground text-sm">Workflow no encontrado.</div>

    <WorkflowStepList v-else :workflow-id="workflow.id" :steps="workflow.steps" />

    <WorkflowActionSheet />
  </div>
</template>
