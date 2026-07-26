<script setup lang="ts">
import { ListIcon, KanbanSquareIcon } from 'lucide-vue-next';
import { usePipelinesQuery, usePipelineQuery } from '~/modules/pipeline';
import { OpportunityKanban, OpportunityPipelineSelector, OpportunityFiltersPanel } from '~/modules/opportunity';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const pipelineId = computed(() => route.params['pipelineId'] as string);

const { data: pipelines } = usePipelinesQuery();
const { data: pipeline } = usePipelineQuery(pipelineId);

function handlePipelineChange(id: string) {
  void navigateTo(`/opportunities/kanban/${id}`, { query: route.query });
}

function goToList() {
  void navigateTo({ path: `/opportunities/list/${pipelineId.value}`, query: route.query });
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Page header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b shrink-0">
      <KanbanSquareIcon class="size-4 text-muted-foreground" />
      <h1 class="text-base font-semibold">Oportunidades</h1>
      <OpportunityPipelineSelector
        :model-value="pipelineId"
        :pipelines="pipelines ?? []"
        @update:model-value="handlePipelineChange"
      />
      <div class="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" class="size-8" title="Vista lista" @click="goToList">
          <ListIcon class="size-4" />
        </Button>
        <OpportunityFiltersPanel :statuses="pipeline?.statuses" />
      </div>
    </div>

    <!-- Kanban -->
    <div class="flex-1 overflow-hidden">
      <OpportunityKanban v-if="pipeline" :pipeline="pipeline" />
      <div v-else class="flex items-center justify-center h-full">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  </div>
</template>
