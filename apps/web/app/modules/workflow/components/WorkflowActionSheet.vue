<script setup lang="ts">
import { ArrowLeftIcon } from 'lucide-vue-next';
import { useWorkflowEditorContext } from '../composables/useWorkflowEditorContext';
import { ACTION_TYPE_REGISTRY } from '../composables/useActionTypeRegistry';
import WorkflowActionTypePicker from './WorkflowActionTypePicker.vue';
import WorkflowActionFormContent from './WorkflowActionFormContent.vue';

const { panelState, isOpen, back, close } = useWorkflowEditorContext();

const state = computed(() => panelState.value);

const canGoBack = computed(() => state.value.mode === 'configuring' && !state.value.editing);

const title = computed(() => {
  if (state.value.mode === 'picking') return 'Añadir acción';
  if (state.value.mode === 'configuring') {
    const def = ACTION_TYPE_REGISTRY[state.value.type];
    return state.value.editing ? `Editar — ${def.label}` : def.label;
  }
  return '';
});

const typeIcon = computed(() => {
  if (state.value.mode !== 'configuring') return null;
  return ACTION_TYPE_REGISTRY[state.value.type];
});
</script>

<template>
  <Sheet :open="isOpen" @update:open="(v) => !v && close()">
    <SheetContent side="right" class="p-0 flex flex-col w-[480px] sm:w-[480px] gap-0">
      <div class="flex items-center gap-3 px-4 py-3 border-b shrink-0">
        <button
          v-if="canGoBack"
          class="size-7 rounded flex items-center justify-center hover:bg-muted transition-colors"
          @click="back"
        >
          <ArrowLeftIcon class="size-4" />
        </button>
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div
            v-if="typeIcon"
            class="size-6 rounded flex items-center justify-center shrink-0"
            :class="typeIcon.iconClass"
          >
            <component :is="typeIcon.icon" class="size-3.5" />
          </div>
          <span class="text-sm font-semibold truncate">{{ title }}</span>
        </div>
      </div>

      <template v-if="state.mode === 'picking'">
        <WorkflowActionTypePicker />
      </template>

      <template v-else-if="state.mode === 'configuring'">
        <WorkflowActionFormContent
          :type="state.type"
          :editing="state.editing"
          @saved="close"
          @cancel="canGoBack ? back() : close()"
        />
      </template>
    </SheetContent>
  </Sheet>
</template>
