<script setup lang="ts">
import { SearchIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import type { DefaultWorkflowStepActionDto } from '@tfg/types';
import { useWorkflowEditorContext } from '../../composables/useWorkflowEditorContext';
import { useCreateDefaultStepActionMutation } from '../../composables/api/useCreateDefaultStepActionMutation';
import { useUpdateDefaultStepActionMutation } from '../../composables/api/useUpdateDefaultStepActionMutation';
import { useDefaultControlQuestionsQuery } from '~/modules/control-question';

const props = defineProps<{
  editing?: DefaultWorkflowStepActionDto;
}>();

const emit = defineEmits<{ saved: []; cancel: [] }>();

const { workflowId, panelState, currentStepActions, nextPosition } = useWorkflowEditorContext();

const stepId = computed(() => {
  const s = panelState.value;
  return s.mode !== 'closed' ? s.stepId : '';
});

const { mutate: create, isPending: isCreating } = useCreateDefaultStepActionMutation();
const { mutate: update, isPending: isUpdating } = useUpdateDefaultStepActionMutation();
const isPending = computed(() => isCreating.value || isUpdating.value);

const { data, isError, refetch } = useDefaultControlQuestionsQuery();
const allItems = computed(() => data.value?.pages.flatMap((p) => p.items) ?? []);

const search = ref('');
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return allItems.value;
  return allItems.value.filter((cq) => cq.question.toLowerCase().includes(q));
});

const alreadyAddedIds = computed(
  () =>
    new Set(
      currentStepActions.value
        .filter((a) => a.targetType === 'control_question' && a.id !== props.editing?.id)
        .map((a) => a.targetId)
        .filter(Boolean),
    ),
);

function handleSelect(cqId: string, question: string) {
  if (alreadyAddedIds.value.has(cqId)) return;

  const name = question.length > 60 ? `${question.slice(0, 60)}…` : question;

  if (props.editing) {
    update(
      {
        workflowId: workflowId.value,
        stepId: stepId.value,
        actionId: props.editing.id,
        name,
        targetType: 'control_question',
        targetId: cqId,
        metadata: undefined,
        position: props.editing.position,
      },
      {
        onSuccess: () => {
          toast.success('Acción actualizada');
          emit('saved');
        },
        onError: () => toast.error('Error al actualizar'),
      },
    );
  } else {
    create(
      {
        workflowId: workflowId.value,
        stepId: stepId.value,
        id: uuidv7(),
        name,
        targetType: 'control_question',
        targetId: cqId,
        metadata: undefined,
        position: nextPosition.value,
      },
      {
        onSuccess: () => {
          toast.success('Acción añadida');
          emit('saved');
        },
        onError: () => toast.error('Error al añadir'),
      },
    );
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 border-b">
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input v-model="search" placeholder="Buscar pregunta..." class="pl-9" />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <QueryErrorState
        v-if="isError"
        class="m-4"
        message="No se pudieron cargar las preguntas de control."
        @retry="refetch()"
      />
      <div v-else-if="!allItems.length" class="flex flex-col items-center justify-center h-full py-12 text-center">
        <p class="text-sm text-muted-foreground">No hay preguntas de control configuradas.</p>
        <NuxtLink to="/settings/control-questions" class="text-sm text-primary mt-1 hover:underline">
          Ir a configuración
        </NuxtLink>
      </div>

      <div v-else-if="!filtered.length" class="py-8 text-center text-sm text-muted-foreground">
        Sin resultados para "{{ search }}"
      </div>

      <button
        v-for="cq in filtered"
        :key="cq.id"
        class="w-full flex items-start gap-3 px-4 py-3 text-left border-b last:border-0 transition-colors"
        :class="[
          alreadyAddedIds.has(cq.id)
            ? 'opacity-50 cursor-not-allowed bg-muted/30'
            : editing?.targetId === cq.id
              ? 'bg-primary/5 hover:bg-primary/10'
              : 'hover:bg-muted/40',
        ]"
        :disabled="alreadyAddedIds.has(cq.id) || isPending"
        @click="handleSelect(cq.id, cq.question)"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm leading-snug">{{ cq.question }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ cq.answerType === 'BOOLEAN' ? 'Sí / No' : 'Texto libre' }}
          </p>
        </div>
        <Badge v-if="alreadyAddedIds.has(cq.id)" variant="outline" class="text-xs shrink-0 mt-0.5"> Ya añadida </Badge>
        <Badge
          v-else-if="editing?.targetId === cq.id"
          variant="outline"
          class="text-xs shrink-0 mt-0.5 border-primary text-primary"
        >
          Actual
        </Badge>
      </button>
    </div>

    <div class="p-4 border-t">
      <Button variant="outline" size="sm" class="w-full" @click="emit('cancel')">Cancelar</Button>
    </div>
  </div>
</template>
