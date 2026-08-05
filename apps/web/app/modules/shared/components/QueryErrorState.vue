<script setup lang="ts">
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-vue-next';

withDefaults(defineProps<{ message?: string }>(), {
  message: 'No se pudieron cargar los datos.',
});

defineEmits<{ retry: [] }>();
</script>

<template>
  <div
    role="alert"
    class="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
  >
    <AlertCircleIcon class="size-8 text-destructive" />
    <p class="mt-3 text-sm font-medium text-destructive">{{ message }}</p>
    <Button type="button" variant="outline" size="sm" class="mt-4" @click="$emit('retry')">
      <RefreshCwIcon class="mr-2 size-4" />
      Reintentar
    </Button>
  </div>
</template>
