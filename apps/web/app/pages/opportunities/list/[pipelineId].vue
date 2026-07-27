<script setup lang="ts">
import { KanbanSquareIcon, ListIcon } from 'lucide-vue-next';
import { usePipelinesQuery, usePipelineQuery } from '~/modules/pipeline';
import { useMembersQuery } from '~/modules/auth';
import {
  OpportunityListTable,
  OpportunityPipelineSelector,
  OpportunityFiltersBar,
  useOpportunitiesQuery,
  useOpportunityFilters,
} from '~/modules/opportunity';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const pipelineId = computed(() => route.params['pipelineId'] as string);

const { data: pipelines } = usePipelinesQuery();
const { data: pipeline } = usePipelineQuery(pipelineId);
const { data: members } = useMembersQuery();

const { filters } = useOpportunityFilters();
const page = ref(1);

const queryFilters = computed(() => ({
  pipelineId: pipelineId.value,
  ...filters.value,
  page: page.value,
  limit: 20,
}));

const { data, isLoading } = useOpportunitiesQuery(queryFilters);

// Reset page on filter change
watch(filters, () => {
  page.value = 1;
});

function handlePipelineChange(id: string) {
  void navigateTo(`/opportunities/list/${id}`, { query: route.query });
}

function goToKanban() {
  void navigateTo({ path: `/opportunities/kanban/${pipelineId.value}`, query: route.query });
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <!-- Page header -->
    <div class="flex shrink-0 items-center gap-3 border-b px-4 py-3">
      <ListIcon class="size-4 text-muted-foreground" />
      <h1 class="text-base font-semibold">Oportunidades</h1>
      <OpportunityPipelineSelector
        :model-value="pipelineId"
        :pipelines="pipelines ?? []"
        @update:model-value="handlePipelineChange"
      />
      <div class="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" class="size-8" title="Vista kanban" @click="goToKanban">
          <KanbanSquareIcon class="size-4" />
        </Button>
      </div>
    </div>

    <OpportunityFiltersBar :statuses="pipeline?.statuses" :members="members" />

    <!-- List -->
    <div class="min-h-0 flex-1 overflow-auto p-4">
      <OpportunityListTable :opportunities="data?.items ?? []" :is-loading="isLoading" :pipeline="pipeline" />

      <!-- Pagination -->
      <div v-if="(data?.total ?? 0) > 20" class="flex items-center justify-center gap-3 mt-4">
        <Button size="sm" variant="outline" :disabled="page === 1" @click="page--">Anterior</Button>
        <span class="text-sm text-muted-foreground">Página {{ page }}</span>
        <Button size="sm" variant="outline" :disabled="!data || data.items.length < 20" @click="page++"
          >Siguiente</Button
        >
      </div>
    </div>
  </div>
</template>
