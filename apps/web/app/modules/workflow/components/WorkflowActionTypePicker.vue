<script setup lang="ts">
import { ACTION_TYPE_REGISTRY, ACTION_TYPE_CATEGORIES } from '../composables/useActionTypeRegistry';
import { useWorkflowEditorContext } from '../composables/useWorkflowEditorContext';

const { selectType } = useWorkflowEditorContext();

const typesByCategory = computed(() =>
  ACTION_TYPE_CATEGORIES.map((cat) => ({
    ...cat,
    types: Object.entries(ACTION_TYPE_REGISTRY)
      .filter(([, def]) => def.category === cat.key)
      .map(([key, def]) => ({ key, ...def })),
  })).filter((cat) => cat.types.length > 0),
);
</script>

<template>
  <div class="overflow-y-auto flex-1 p-4 space-y-5">
    <div v-for="cat in typesByCategory" :key="cat.key" class="space-y-2">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
        {{ cat.label }}
      </p>
      <div class="space-y-1.5">
        <button
          v-for="type in cat.types"
          :key="type.key"
          class="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
          :class="type.borderClass"
          @click="selectType(type.key as any)"
        >
          <div class="size-8 rounded-md flex items-center justify-center shrink-0" :class="type.iconClass">
            <component :is="type.icon" class="size-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ type.label }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ type.description }}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
