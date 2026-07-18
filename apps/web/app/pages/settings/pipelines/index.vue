<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import { PipelineCard, PipelineCreateDialog, usePipelinesInfiniteQuery } from '~/modules/pipeline';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = usePipelinesInfiniteQuery();

const pipelines = computed(() => data.value?.pages.flatMap((p) => p.items) ?? []);
const total = computed(() => data.value?.pages[0]?.total ?? 0);

const sentinel = ref<HTMLElement | null>(null);

useIntersectionObserver(sentinel, ([entry]) => {
  if (entry?.isIntersecting && hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage();
  }
});
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Pipelines</h2>
        <p class="text-sm text-muted-foreground mt-1">
          {{ isLoading ? 'Cargando...' : `${total} pipeline${total === 1 ? '' : 's'}` }}
        </p>
      </div>
      <PipelineCreateDialog />
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="h-32 rounded-xl bg-muted animate-pulse" />
    </div>

    <template v-else>
      <div v-if="!pipelines.length" class="text-center py-16 text-muted-foreground">
        <p class="text-sm">No tienes pipelines aún. Crea uno para empezar.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PipelineCard v-for="pipeline in pipelines" :key="pipeline.id" :pipeline="pipeline" />
      </div>

      <!-- Sentinel de scroll infinito -->
      <div ref="sentinel" class="h-8 flex items-center justify-center mt-4">
        <span v-if="isFetchingNextPage" class="text-sm text-muted-foreground">Cargando más...</span>
      </div>
    </template>
  </div>
</template>
