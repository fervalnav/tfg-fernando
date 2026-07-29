<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '~/modules/shared/lib';

const props = defineProps<{
  class?: HTMLAttributes['class'];
  modelValue?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <textarea
    :value="modelValue"
    :class="
      cn(
        'flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
