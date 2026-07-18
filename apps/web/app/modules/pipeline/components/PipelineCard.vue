<script setup lang="ts">
import type { PipelineDto } from '@tfg/types';
import { toast } from 'vue-sonner';
import { useDeletePipelineMutation } from '../composables/api/useDeletePipelineMutation';

const props = defineProps<{ pipeline: PipelineDto }>();

const { mutate: deletePipeline, isPending: isDeleting } = useDeletePipelineMutation();

function handleDelete() {
  deletePipeline(props.pipeline.id, {
    onSuccess: () => toast.success('Pipeline eliminado'),
    onError: () => toast.error('Error al eliminar el pipeline'),
  });
}
</script>

<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <CardTitle class="text-base">{{ pipeline.name }}</CardTitle>
        <div class="flex gap-1">
          <Button as-child size="sm" variant="ghost">
            <NuxtLink :to="`/settings/pipelines/${pipeline.id}`">Editar</NuxtLink>
          </Button>
          <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive" :disabled="isDeleting" @click="handleDelete">
            Eliminar
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="flex flex-wrap gap-1">
        <Badge
          v-for="status in pipeline.statuses"
          :key="status.id"
          variant="outline"
          class="text-xs"
          :style="status.backgroundColor ? { backgroundColor: status.backgroundColor, color: status.textColor ?? undefined, borderColor: status.backgroundColor } : {}"
        >
          {{ status.name }}
        </Badge>
      </div>
      <p class="text-xs text-muted-foreground mt-2">{{ pipeline.statuses.length }} estados</p>
    </CardContent>
  </Card>
</template>
