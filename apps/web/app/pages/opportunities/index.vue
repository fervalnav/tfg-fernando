<script setup lang="ts">
import { usePipelinesQuery } from '~/modules/pipeline';

definePageMeta({ middleware: 'auth' });

const { data: pipelines, isLoading } = usePipelinesQuery();

watch(
  pipelines,
  (list) => {
    if (!list?.length) return;
    const first = list[0];
    if (!first) return;
    void navigateTo(`/opportunities/kanban/${first.id}`, { replace: true });
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div v-if="isLoading" class="text-sm text-muted-foreground">Cargando...</div>
    <div v-else-if="!pipelines?.length" class="text-center space-y-2">
      <p class="text-sm text-muted-foreground">No tienes pipelines configurados.</p>
      <Button as-child size="sm" variant="outline">
        <NuxtLink to="/settings/pipelines">Ir a configuración</NuxtLink>
      </Button>
    </div>
  </div>
</template>
