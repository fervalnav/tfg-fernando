<script setup lang="ts">
import { BotIcon, FileTextIcon, LoaderCircleIcon, SaveIcon, SparklesIcon, XCircleIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import {
  useOpportunitySummariesQuery,
  useSummaryTemplatesForOpportunityQuery,
} from '../composables/api/useOpportunityQualificationQueries';
import {
  useAddSummaryToOpportunityMutation,
  useGenerateSummaryMutation,
  useUpdateSummaryResultMutation,
} from '../composables/api/useOpportunityQualificationMutations';
import OpportunityAddTemplatesDialog from './OpportunityAddTemplatesDialog.vue';

const props = defineProps<{ opportunityId: string }>();
const { data: summaries, isLoading, isError, refetch } = useOpportunitySummariesQuery(() => props.opportunityId);
const { data: templates } = useSummaryTemplatesForOpportunityQuery();
const { mutate: updateSummary, isPending } = useUpdateSummaryResultMutation();
const { mutate: addSummary } = useAddSummaryToOpportunityMutation();
const { mutate: generateSummary, isPending: isRequestingGeneration } = useGenerateSummaryMutation();
const draftResults = ref<Record<string, string>>({});
const pendingTemplateId = ref<string>();
const installedTemplateIds = computed(() => summaries.value?.map((item) => item.summaryTemplateId) ?? []);
const templateOptions = computed(
  () =>
    templates.value?.map((template) => ({
      id: template.id,
      title: template.name,
      description: template.prompt,
    })) ?? [],
);

watch(
  summaries,
  (items) => {
    for (const item of items ?? []) draftResults.value[item.id] = normalizeSummaryText(item.result ?? '');
  },
  { immediate: true },
);

function normalizeSummaryText(value: string): string {
  return value.replaceAll('\\r\\n', '\n').replaceAll('\\n', '\n').replaceAll('\\r', '\n');
}

function save(id: string): void {
  const result = draftResults.value[id]?.trim();
  if (!result) {
    toast.error('El resumen no puede estar vacío');
    return;
  }
  updateSummary(
    { opportunityId: props.opportunityId, summaryId: id, result },
    {
      onSuccess: () => toast.success('Resumen actualizado'),
      onError: () => toast.error('No se pudo actualizar el resumen'),
    },
  );
}

function add(templateId: string): void {
  pendingTemplateId.value = templateId;
  addSummary(
    {
      id: uuidv7(),
      opportunityId: props.opportunityId,
      summaryTemplateId: templateId,
    },
    {
      onSuccess: () => toast.success('Resumen añadido'),
      onError: () => toast.error('No se pudo añadir el resumen'),
      onSettled: () => (pendingTemplateId.value = undefined),
    },
  );
}

function generate(id: string): void {
  generateSummary(
    { opportunityId: props.opportunityId, summaryId: id },
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
        <h2 class="mt-2 text-2xl font-semibold">Resúmenes</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Síntesis preparadas a partir de la información disponible y revisables por el equipo.
        </p>
      </div>
      <OpportunityAddTemplatesDialog
        title="Añadir resúmenes"
        description="Selecciona las plantillas que quieres incorporar a esta oportunidad."
        empty-label="No hay plantillas de resumen disponibles."
        :templates="templateOptions"
        :installed-template-ids="installedTemplateIds"
        :pending-template-id="pendingTemplateId"
        @add="add"
      />
    </div>

    <div v-if="isLoading" class="py-12 text-center text-sm text-muted-foreground">Cargando resúmenes...</div>
    <QueryErrorState v-else-if="isError" message="No se pudieron cargar los resúmenes." @retry="refetch()" />
    <Card v-else-if="!summaries?.length">
      <CardContent class="flex flex-col items-center py-12 text-center">
        <FileTextIcon class="size-9 text-muted-foreground/50" />
        <p class="mt-3 font-medium">No hay resúmenes configurados</p>
        <p class="mt-1 text-sm text-muted-foreground">Esta oportunidad no tiene plantillas de resumen.</p>
      </CardContent>
    </Card>

    <div v-else class="space-y-4">
      <Card v-for="summary in summaries" :key="summary.id">
        <CardHeader>
          <div class="flex items-start justify-between gap-4">
            <div>
              <CardTitle class="text-base">{{ summary.name }}</CardTitle>
            </div>
            <Badge
              v-if="summary.generationStatus === 'PENDING' || summary.generationStatus === 'PROCESSING'"
              variant="secondary"
              class="gap-1 text-blue-700"
            >
              <LoaderCircleIcon class="size-3.5 animate-spin" />
              Generando
            </Badge>
            <Badge v-else-if="summary.generationStatus === 'FAILED'" variant="destructive" class="gap-1">
              <XCircleIcon class="size-3.5" />
              Error
            </Badge>
            <Badge v-else variant="secondary" class="gap-1 text-violet-700">
              <SparklesIcon class="size-3.5" />
              Asistido por IA
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <p v-if="summary.generationError" class="text-sm text-destructive">
            {{ summary.generationError }}
          </p>
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <label :for="`summary-result-${summary.id}`" class="text-sm font-medium">Resultado del resumen</label>
              <span class="text-xs text-muted-foreground">Editable y revisable</span>
            </div>
            <Textarea
              :id="`summary-result-${summary.id}`"
              v-model="draftResults[summary.id]"
              class="min-h-[20rem] resize-y font-normal leading-6"
              placeholder="El resultado se mostrará aquí..."
            />
          </div>
          <details class="rounded-lg border bg-muted/20 px-4 py-3">
            <summary class="cursor-pointer text-sm font-medium text-muted-foreground">
              Ver prompt de la plantilla
            </summary>
            <p class="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{{ summary.prompt }}</p>
          </details>
          <div class="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="
                isRequestingGeneration ||
                summary.generationStatus === 'PENDING' ||
                summary.generationStatus === 'PROCESSING'
              "
              @click="generate(summary.id)"
            >
              <SparklesIcon class="mr-2 size-4" />
              {{ summary.generationStatus === 'COMPLETED' ? 'Regenerar' : 'Generar con IA' }}
            </Button>
            <Button size="sm" :disabled="isPending" @click="save(summary.id)">
              <SaveIcon class="mr-2 size-4" />
              Guardar revisión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
