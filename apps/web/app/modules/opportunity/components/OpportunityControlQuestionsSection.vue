<script setup lang="ts">
import {
  BotIcon,
  CheckCircle2Icon,
  CircleHelpIcon,
  LoaderCircleIcon,
  SaveIcon,
  SparklesIcon,
  XCircleIcon,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import type { ControlQuestionAnswer } from '@tfg/types';
import {
  useControlQuestionTemplatesQuery,
  useOpportunityControlQuestionsQuery,
} from '../composables/api/useOpportunityQualificationQueries';
import {
  useAddControlQuestionToOpportunityMutation,
  useAnswerControlQuestionMutation,
  useGenerateControlQuestionMutation,
} from '../composables/api/useOpportunityQualificationMutations';
import OpportunityAddTemplatesDialog from './OpportunityAddTemplatesDialog.vue';

const props = defineProps<{ opportunityId: string }>();
const { data: questions, isLoading, isError, refetch } = useOpportunityControlQuestionsQuery(() => props.opportunityId);
const { data: templates } = useControlQuestionTemplatesQuery();
const { mutate: answerQuestion, isPending } = useAnswerControlQuestionMutation();
const { mutate: addQuestion } = useAddControlQuestionToOpportunityMutation();
const { mutate: generateQuestion, isPending: isRequestingGeneration } = useGenerateControlQuestionMutation();
const draftAnswers = ref<Record<string, Exclude<ControlQuestionAnswer, null>>>({});
const pendingTemplateId = ref<string>();
const installedTemplateIds = computed(() => questions.value?.map((item) => item.defaultControlQuestionId) ?? []);
const templateOptions = computed(
  () =>
    templates.value?.map((template) => ({
      id: template.id,
      title: template.question,
      description: template.passConditionPrompt,
    })) ?? [],
);

watch(
  questions,
  (items) => {
    for (const item of items ?? []) {
      if (item.answer !== null) draftAnswers.value[item.id] = item.answer;
    }
  },
  { immediate: true },
);

function save(id: string): void {
  const answer = draftAnswers.value[id];
  if (answer === undefined || answer === '') {
    toast.error('Introduce una respuesta');
    return;
  }
  answerQuestion(
    { opportunityId: props.opportunityId, controlQuestionId: id, answer },
    {
      onSuccess: () => toast.success('Respuesta guardada'),
      onError: () => toast.error('No se pudo guardar la respuesta'),
    },
  );
}

function textAnswer(id: string): string {
  const value = draftAnswers.value[id];
  return typeof value === 'string' ? value : '';
}

function updateTextAnswer(id: string, value: string | number): void {
  draftAnswers.value[id] = String(value);
}

function add(templateId: string): void {
  pendingTemplateId.value = templateId;
  addQuestion(
    {
      id: uuidv7(),
      opportunityId: props.opportunityId,
      defaultControlQuestionId: templateId,
    },
    {
      onSuccess: () => toast.success('Pregunta añadida'),
      onError: () => toast.error('No se pudo añadir la pregunta'),
      onSettled: () => (pendingTemplateId.value = undefined),
    },
  );
}

function generate(id: string): void {
  generateQuestion(
    { opportunityId: props.opportunityId, controlQuestionId: id },
    {
      onSuccess: () => toast.success('Generación iniciada'),
      onError: () => toast.error('No se pudo iniciar la generación'),
    },
  );
}
</script>

<template>
  <section>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-violet-600">
          <BotIcon class="size-4" />
          <span class="text-sm font-medium">Cualificación inteligente</span>
        </div>
        <h2 class="mt-2 text-2xl font-semibold">Preguntas de control</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Revisa y completa las respuestas que determinan si la oportunidad cumple los criterios.
        </p>
      </div>
      <OpportunityAddTemplatesDialog
        title="Añadir preguntas de control"
        description="Selecciona las plantillas que quieres incorporar a esta oportunidad."
        empty-label="No hay plantillas de preguntas disponibles."
        :templates="templateOptions"
        :installed-template-ids="installedTemplateIds"
        :pending-template-id="pendingTemplateId"
        @add="add"
      />
    </div>

    <div v-if="isLoading" class="py-12 text-center text-sm text-muted-foreground">Cargando preguntas...</div>
    <QueryErrorState v-else-if="isError" message="No se pudieron cargar las preguntas de control." @retry="refetch()" />
    <Card v-else-if="!questions?.length">
      <CardContent class="flex flex-col items-center py-12 text-center">
        <CircleHelpIcon class="size-9 text-muted-foreground/50" />
        <p class="mt-3 font-medium">No hay preguntas de control</p>
        <p class="mt-1 text-sm text-muted-foreground">Esta oportunidad no tiene preguntas configuradas.</p>
      </CardContent>
    </Card>

    <div v-else class="space-y-4">
      <Card v-for="question in questions" :key="question.id">
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <CardTitle class="text-base">{{ question.question }}</CardTitle>
              <CardDescription v-if="question.passConditionPrompt" class="mt-1">
                {{ question.passConditionPrompt }}
              </CardDescription>
            </div>
            <Badge
              v-if="question.aiStatus === 'PENDING' || question.aiStatus === 'PROCESSING'"
              variant="secondary"
              class="shrink-0 gap-1 text-blue-700"
            >
              <LoaderCircleIcon class="size-3.5 animate-spin" />
              Generando
            </Badge>
            <Badge v-else-if="question.aiStatus === 'FAILED'" variant="destructive" class="shrink-0 gap-1">
              <XCircleIcon class="size-3.5" />
              Error
            </Badge>
            <Badge v-else-if="question.answer !== null" variant="secondary" class="shrink-0 gap-1 text-emerald-700">
              <CheckCircle2Icon class="size-3.5" />
              Respondida
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-if="question.aiEvidence" class="rounded-md border bg-muted/30 p-3 text-sm">
            <p class="font-medium">Evidencia de IA</p>
            <p class="mt-1 text-muted-foreground">{{ question.aiEvidence }}</p>
            <p v-if="question.aiPassed !== null" class="mt-2 font-medium">
              Criterio: {{ question.aiPassed ? 'Cumplido' : 'No cumplido' }}
            </p>
          </div>
          <p v-if="question.aiError" class="text-sm text-destructive">{{ question.aiError }}</p>
          <div class="space-y-3">
            <Input
              v-if="question.answerType === 'TEXT'"
              :model-value="textAnswer(question.id)"
              placeholder="Escribe la respuesta..."
              @update:model-value="updateTextAnswer(question.id, $event)"
              @keyup.enter="save(question.id)"
            />
            <Select
              v-else
              :model-value="
                typeof draftAnswers[question.id] === 'boolean' ? String(draftAnswers[question.id]) : undefined
              "
              @update:model-value="draftAnswers[question.id] = $event === 'true'"
            >
              <SelectTrigger class="w-full"><SelectValue placeholder="Selecciona una respuesta" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            <div class="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="
                  isRequestingGeneration || question.aiStatus === 'PENDING' || question.aiStatus === 'PROCESSING'
                "
                @click="generate(question.id)"
              >
                <SparklesIcon class="mr-2 size-4" />
                {{ question.aiStatus === 'COMPLETED' ? 'Regenerar' : 'Responder con IA' }}
              </Button>
              <Button size="sm" :disabled="isPending" @click="save(question.id)">
                <SaveIcon class="mr-2 size-4" />
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
