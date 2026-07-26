<script setup lang="ts">
import { ChevronDownIcon, CheckIcon } from 'lucide-vue-next';
import type { PipelineDto } from '@tfg/types';

const props = defineProps<{
  modelValue: string;
  pipelines: PipelineDto[];
}>();

const emit = defineEmits<{ 'update:modelValue': [id: string] }>();

const currentPipeline = computed(() => props.pipelines.find((p) => p.id === props.modelValue));
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 gap-1.5">
        <span class="max-w-40 truncate">{{ currentPipeline?.name ?? 'Seleccionar pipeline' }}</span>
        <ChevronDownIcon class="size-3.5 shrink-0" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-52">
      <DropdownMenuItem
        v-for="pipeline in pipelines"
        :key="pipeline.id"
        @click="emit('update:modelValue', pipeline.id)"
      >
        <CheckIcon v-if="pipeline.id === modelValue" class="mr-2 size-4" />
        <span v-else class="mr-2 size-4 inline-block" />
        {{ pipeline.name }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
