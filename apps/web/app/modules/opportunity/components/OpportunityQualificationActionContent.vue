<script setup lang="ts">
import { SaveIcon, SparklesIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import type { DefaultWorkflowStepActionDto, CustomFieldValue, WorkflowStepActionDto } from '@tfg/types';
import {
  useOpportunityControlQuestionsQuery,
  useOpportunityCustomFieldsQuery,
  useOpportunitySummariesQuery,
} from '../composables/api/useOpportunityQualificationQueries';
import {
  useAnswerControlQuestionMutation,
  useSetCustomFieldValueMutation,
  useUpdateSummaryResultMutation,
} from '../composables/api/useOpportunityQualificationMutations';

const props = defineProps<{
  opportunityId: string;
  definition: DefaultWorkflowStepActionDto;
  action: WorkflowStepActionDto;
}>();

const { data: questions } = useOpportunityControlQuestionsQuery(() => props.opportunityId);
const { data: fields } = useOpportunityCustomFieldsQuery(() => props.opportunityId);
const { data: summaries } = useOpportunitySummariesQuery(() => props.opportunityId);
const { mutate: answerQuestion, isPending: isAnswering } = useAnswerControlQuestionMutation();
const { mutate: setFieldValue, isPending: isSettingField } = useSetCustomFieldValueMutation();
const { mutate: updateSummary, isPending: isUpdatingSummary } = useUpdateSummaryResultMutation();

const question = computed(() => questions.value?.find((item) => item.id === props.action.targetId));
const field = computed(() => fields.value?.find((item) => item.id === props.action.targetId));
const summary = computed(() => summaries.value?.find((item) => item.id === props.action.targetId));

const questionDraft = ref<string | boolean>('');
const fieldDraft = ref<Exclude<CustomFieldValue, null>>('');
const summaryDraft = ref('');

watch(question, (item) => (questionDraft.value = item?.answer ?? ''), { immediate: true });
watch(field, (item) => (fieldDraft.value = item?.value ?? ''), { immediate: true });
watch(summary, (item) => (summaryDraft.value = item?.result ?? ''), { immediate: true });

function saveQuestion(): void {
  if (!question.value || questionDraft.value === '') return;
  answerQuestion(
    {
      opportunityId: props.opportunityId,
      controlQuestionId: question.value.id,
      answer: questionDraft.value,
    },
    {
      onSuccess: () => toast.success('Respuesta guardada y acción completada'),
      onError: () => toast.error('No se pudo guardar la respuesta'),
    },
  );
}

function saveField(): void {
  if (!field.value || fieldDraft.value === '' || (Array.isArray(fieldDraft.value) && !fieldDraft.value.length)) return;
  setFieldValue(
    { opportunityId: props.opportunityId, customFieldId: field.value.id, value: fieldDraft.value },
    {
      onSuccess: () => toast.success('Campo guardado y acción completada'),
      onError: () => toast.error('No se pudo guardar el campo'),
    },
  );
}

function saveSummary(): void {
  if (!summary.value || !summaryDraft.value.trim()) return;
  updateSummary(
    { opportunityId: props.opportunityId, summaryId: summary.value.id, result: summaryDraft.value },
    {
      onSuccess: () => toast.success('Resumen guardado y acción completada'),
      onError: () => toast.error('No se pudo guardar el resumen'),
    },
  );
}
</script>

<template>
  <div v-if="definition.targetType === 'control_question' && question" class="space-y-4">
    <div>
      <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pregunta de control</p>
      <p class="mt-1 font-medium">{{ question.question }}</p>
    </div>
    <Input
      v-if="question.answerType === 'TEXT'"
      :model-value="typeof questionDraft === 'string' ? questionDraft : ''"
      placeholder="Escribe la respuesta..."
      @update:model-value="questionDraft = String($event)"
    />
    <Select
      v-else
      :model-value="typeof questionDraft === 'boolean' ? String(questionDraft) : undefined"
      @update:model-value="questionDraft = $event === 'true'"
    >
      <SelectTrigger><SelectValue placeholder="Selecciona una respuesta" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="true">Sí</SelectItem>
        <SelectItem value="false">No</SelectItem>
      </SelectContent>
    </Select>
    <div class="flex justify-end">
      <Button size="sm" :disabled="isAnswering" @click.stop="saveQuestion">
        <SaveIcon class="mr-2 size-4" />
        Guardar respuesta
      </Button>
    </div>
  </div>

  <div v-else-if="definition.targetType === 'custom_field' && field" class="space-y-4">
    <div>
      <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Campo personalizado</p>
      <p class="mt-1 font-medium">{{ field.name }}</p>
      <p v-if="field.description" class="mt-1 text-sm text-muted-foreground">{{ field.description }}</p>
    </div>
    <Input
      v-if="field.type === 'TEXT' || field.type === 'DATE' || field.type === 'NUMBER'"
      :type="field.type === 'DATE' ? 'date' : field.type === 'NUMBER' ? 'number' : 'text'"
      :model-value="typeof fieldDraft === 'string' || typeof fieldDraft === 'number' ? fieldDraft : ''"
      @update:model-value="fieldDraft = field.type === 'NUMBER' ? Number($event) : String($event)"
    />
    <Select
      v-else-if="field.type === 'BOOLEAN'"
      :model-value="typeof fieldDraft === 'boolean' ? String(fieldDraft) : undefined"
      @update:model-value="fieldDraft = $event === 'true'"
    >
      <SelectTrigger><SelectValue placeholder="Selecciona un valor" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="true">Sí</SelectItem>
        <SelectItem value="false">No</SelectItem>
      </SelectContent>
    </Select>
    <Select
      v-else
      :model-value="typeof fieldDraft === 'string' ? fieldDraft : undefined"
      @update:model-value="fieldDraft = $event"
    >
      <SelectTrigger><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
      <SelectContent>
        <SelectItem v-for="classifier in field.classifiers" :key="classifier" :value="classifier">
          {{ classifier }}
        </SelectItem>
      </SelectContent>
    </Select>
    <div class="flex justify-end">
      <Button size="sm" :disabled="isSettingField" @click.stop="saveField">
        <SaveIcon class="mr-2 size-4" />
        Guardar campo
      </Button>
    </div>
  </div>

  <div v-else-if="definition.targetType === 'summary' && summary" class="space-y-4">
    <div class="flex items-center gap-2 text-violet-600">
      <SparklesIcon class="size-4" />
      <span class="text-sm font-medium">Resultado asistido por IA</span>
    </div>
    <div>
      <p class="font-medium">{{ summary.name }}</p>
      <p class="mt-1 text-sm text-muted-foreground">{{ summary.prompt }}</p>
    </div>
    <Textarea v-model="summaryDraft" placeholder="Escribe o revisa el resumen..." />
    <div class="flex justify-end">
      <Button size="sm" :disabled="isUpdatingSummary" @click.stop="saveSummary">
        <SaveIcon class="mr-2 size-4" />
        Guardar resumen
      </Button>
    </div>
  </div>

  <div v-else class="rounded-lg border border-dashed bg-background p-4">
    <p class="text-sm text-muted-foreground">No se ha encontrado la instancia vinculada a esta acción.</p>
  </div>
</template>
