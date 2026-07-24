<script setup lang="ts">
import { ChevronUpIcon, ChevronDownIcon, PlusIcon, Trash2Icon } from 'lucide-vue-next';
import { v7 as uuidv7 } from 'uuid';
import { toast } from 'vue-sonner';
import type { WorkflowStepDto, WorkflowStepPayload, DefaultWorkflowStepActionDto } from '@tfg/types';
import { useUpdateWorkflowStepsMutation } from '../composables/api/useUpdateWorkflowStepsMutation';
import { useDeleteDefaultStepActionMutation } from '../composables/api/useDeleteDefaultStepActionMutation';
import { useWorkflowEditorContext } from '../composables/useWorkflowEditorContext';
import { ACTION_TYPE_REGISTRY } from '../composables/useActionTypeRegistry';

const props = defineProps<{
  workflowId: string;
  steps: WorkflowStepDto[];
}>();

const { openPicker, editAction } = useWorkflowEditorContext();

const { mutate: saveSteps, isPending: isSaving } = useUpdateWorkflowStepsMutation();
const { mutate: deleteAction } = useDeleteDefaultStepActionMutation();

const localSteps = ref<WorkflowStepPayload[]>([]);

watch(
  () => props.steps,
  (steps) => {
    localSteps.value = steps.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      condition: s.condition ?? undefined,
      position: s.position,
    }));
  },
  { immediate: true },
);

function addStep() {
  const maxPos = localSteps.value.reduce((m, s) => Math.max(m, s.position), 0);
  localSteps.value.push({ id: uuidv7(), name: 'Nuevo paso', type: 'step', position: maxPos + 1 });
  save();
}

function moveUp(index: number) {
  if (index === 0) return;
  const prev = localSteps.value[index - 1];
  const curr = localSteps.value[index];
  if (!prev || !curr) return;
  [prev.position, curr.position] = [curr.position, prev.position];
  localSteps.value.splice(index - 1, 2, curr, prev);
  save();
}

function moveDown(index: number) {
  if (index === localSteps.value.length - 1) return;
  const curr = localSteps.value[index];
  const next = localSteps.value[index + 1];
  if (!curr || !next) return;
  [curr.position, next.position] = [next.position, curr.position];
  localSteps.value.splice(index, 2, next, curr);
  save();
}

function removeStep(index: number) {
  localSteps.value.splice(index, 1);
  localSteps.value.forEach((s, i) => {
    s.position = i + 1;
  });
  save();
}

function toggleType(step: WorkflowStepPayload) {
  step.type = step.type === 'step' ? 'decision' : 'step';
  if (step.type === 'step') step.condition = undefined;
  save();
}

function save() {
  saveSteps(
    { workflowId: props.workflowId, steps: localSteps.value },
    { onError: () => toast.error('Error al guardar pasos') },
  );
}

function handleDeleteAction(stepId: string, actionId: string) {
  deleteAction(
    { workflowId: props.workflowId, stepId, actionId },
    {
      onSuccess: () => toast.success('Acción eliminada'),
      onError: () => toast.error('Error al eliminar'),
    },
  );
}

function stepActions(stepId: string): DefaultWorkflowStepActionDto[] {
  return props.steps.find((s) => s.id === stepId)?.actions ?? [];
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="(step, index) in localSteps" :key="step.id" class="rounded-lg border bg-card">
      <div class="flex items-center gap-2 p-3">
        <div class="flex flex-col gap-0.5">
          <Button size="icon" variant="ghost" class="size-6" :disabled="index === 0 || isSaving" @click="moveUp(index)">
            <ChevronUpIcon class="size-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            class="size-6"
            :disabled="index === localSteps.length - 1 || isSaving"
            @click="moveDown(index)"
          >
            <ChevronDownIcon class="size-3" />
          </Button>
        </div>
        <div class="flex-1 min-w-0">
          <input
            v-model="step.name"
            class="w-full text-sm font-medium bg-transparent border-none outline-none focus:ring-1 focus:ring-ring rounded px-1 -mx-1"
            @blur="save"
            @keydown.enter.prevent="save"
          >
          <div class="flex items-center gap-2 mt-1">
            <Badge
              :variant="step.type === 'decision' ? 'default' : 'outline'"
              class="text-xs cursor-pointer"
              @click="toggleType(step)"
            >
              {{ step.type === 'decision' ? 'Decisión' : 'Paso' }}
            </Badge>
            <input
              v-if="step.type === 'decision'"
              v-model="step.condition"
              placeholder="Condición de la decisión..."
              class="text-xs text-muted-foreground bg-transparent border-none outline-none focus:ring-1 focus:ring-ring rounded px-1 flex-1"
              @blur="save"
              @keydown.enter.prevent="save"
            >
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          class="size-7 shrink-0 text-destructive hover:text-destructive"
          @click="removeStep(index)"
        >
          <Trash2Icon class="size-3.5" />
        </Button>
      </div>

      <div class="border-t px-3 pb-3 pt-2 space-y-1.5">
        <button
          v-for="action in stepActions(step.id)"
          :key="action.id"
          class="w-full flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-left hover:bg-muted/40 transition-colors group"
          :class="ACTION_TYPE_REGISTRY[action.targetType]?.borderClass"
          @click="editAction(step.id, action)"
        >
          <div
            class="size-6 rounded flex items-center justify-center shrink-0"
            :class="ACTION_TYPE_REGISTRY[action.targetType]?.iconClass"
          >
            <component :is="ACTION_TYPE_REGISTRY[action.targetType]?.icon" class="size-3.5" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium truncate">{{ action.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ ACTION_TYPE_REGISTRY[action.targetType]?.label ?? action.targetType }}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            class="size-6 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
            @click.stop="handleDeleteAction(step.id, action.id)"
          >
            <Trash2Icon class="size-3" />
          </Button>
        </button>

        <button
          class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          @click="openPicker(step.id)"
        >
          <PlusIcon class="size-3" /> Añadir acción
        </button>
      </div>
    </div>

    <Button variant="outline" size="sm" class="w-full gap-2" :disabled="isSaving" @click="addStep">
      <PlusIcon class="size-4" /> Añadir paso
    </Button>
  </div>
</template>
