<script setup lang="ts">
import { LoaderCircleIcon, SaveIcon, SparklesIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import type { DefaultWorkflowStepActionDto, CustomFieldValue, WorkflowStepActionDto } from '@tfg/types';
import {
  useOpportunityControlQuestionsQuery,
  useOpportunityCustomFieldsQuery,
  useOpportunitySummariesQuery,
} from '../composables/api/useOpportunityQualificationQueries';
import {
  useAnswerControlQuestionMutation,
  useGenerateControlQuestionMutation,
  useGenerateCustomFieldMutation,
  useGenerateSummaryMutation,
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
const { mutate: generateQuestion, isPending: isGeneratingQuestion } = useGenerateControlQuestionMutation();
const { mutate: generateField, isPending: isGeneratingField } = useGenerateCustomFieldMutation();
const { mutate: generateSummary, isPending: isGeneratingSummary } = useGenerateSummaryMutation();

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

function requestQuestionGeneration(): void {
  if (!question.value) return;
  generateQuestion(
    { opportunityId: props.opportunityId, controlQuestionId: question.value.id },
    {
      onSuccess: () => toast.success('Generación iniciada'),
      onError: () => toast.error('No se pudo generar la respuesta'),
    },
  );
}

function requestFieldGeneration(): void {
  if (!field.value) return;
  generateField(
    { opportunityId: props.opportunityId, customFieldId: field.value.id },
    {
      onSuccess: () => toast.success('Generación iniciada'),
      onError: () => toast.error('No se pudo generar el campo'),
    },
  );
}

function requestSummaryGeneration(): void {
  if (!summary.value) return;
  generateSummary(
    { opportunityId: props.opportunityId, summaryId: summary.value.id },
    {
      onSuccess: () => toast.success('Generación iniciada'),
      onError: () => toast.error('No se pudo generar el resumen'),
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
    <div v-if="question.aiEvidence" class="rounded-md border bg-background p-3 text-sm">
      <p class="font-medium">Evidencia de IA</p>
      <p class="mt-1 text-muted-foreground">{{ question.aiEvidence }}</p>
    </div>
    <p v-if="question.aiError" class="text-sm text-destructive">{{ question.aiError }}</p>
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
    <div class="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="isGeneratingQuestion || question.aiStatus === 'PENDING' || question.aiStatus === 'PROCESSING'"
        @click.stop="requestQuestionGeneration"
      >
        <LoaderCircleIcon
          v-if="question.aiStatus === 'PENDING' || question.aiStatus === 'PROCESSING'"
          class="mr-2 size-4 animate-spin"
        />
        <SparklesIcon v-else class="mr-2 size-4" />
        {{ question.aiStatus === 'COMPLETED' ? 'Regenerar' : 'Responder con IA' }}
      </Button>
      <Button size="sm" :disabled="isAnswering" @click.stop="saveQuestion">
        <SaveIcon class="mr-2 size-4" />
        Guardar respuesta
      </Button>
    </div>
    <div v-if="field.aiEvidence" class="rounded-md border bg-background p-3 text-sm">
      <p class="font-medium">Evidencia de IA</p>
      <p class="mt-1 text-muted-foreground">{{ field.aiEvidence }}</p>
    </div>
    <p v-if="field.aiError" class="text-sm text-destructive">{{ field.aiError }}</p>
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
    <div class="flex flex-wrap justify-end gap-2">
      <Button
        v-if="field.automatic"
        variant="outline"
        size="sm"
        :disabled="isGeneratingField || field.aiStatus === 'PENDING' || field.aiStatus === 'PROCESSING'"
        @click.stop="requestFieldGeneration"
      >
        <LoaderCircleIcon
          v-if="field.aiStatus === 'PENDING' || field.aiStatus === 'PROCESSING'"
          class="mr-2 size-4 animate-spin"
        />
        <SparklesIcon v-else class="mr-2 size-4" />
        {{ field.aiStatus === 'COMPLETED' ? 'Regenerar' : 'Generar con IA' }}
      </Button>
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
    <p v-if="summary.generationError" class="text-sm text-destructive">{{ summary.generationError }}</p>
    <div class="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="
          isGeneratingSummary || summary.generationStatus === 'PENDING' || summary.generationStatus === 'PROCESSING'
        "
        @click.stop="requestSummaryGeneration"
      >
        <LoaderCircleIcon
          v-if="summary.generationStatus === 'PENDING' || summary.generationStatus === 'PROCESSING'"
          class="mr-2 size-4 animate-spin"
        />
        <SparklesIcon v-else class="mr-2 size-4" />
        {{ summary.generationStatus === 'COMPLETED' ? 'Regenerar' : 'Generar con IA' }}
      </Button>
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
