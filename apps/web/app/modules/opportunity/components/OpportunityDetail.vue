<script setup lang="ts">
import {
  ArrowLeftIcon,
  BotIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleIcon,
  CircleHelpIcon,
  GitBranchIcon,
  InfoIcon,
  ListChecksIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  PencilIcon,
  RotateCcwIcon,
  SparklesIcon,
  Trash2Icon,
} from 'lucide-vue-next';
import type { Component } from 'vue';
import { toast } from 'vue-sonner';
import type {
  AccountMemberDto,
  DefaultWorkflowStepActionDto,
  OpportunityDto,
  PipelineDto,
  WorkflowDto,
  WorkflowStepActionDto,
  WorkflowStepDto,
} from '@tfg/types';
import { useOpportunityWorkflowQuery } from '../composables/api/useOpportunityWorkflowQuery';
import {
  useAssignOpportunityWorkflowMutation,
  useReEvaluateWorkflowDecisionMutation,
} from '../composables/api/useOpportunityWorkflowMutations';
import OpportunityDeleteDialog from './OpportunityDeleteDialog.vue';
import OpportunityEditDialog from './OpportunityEditDialog.vue';
import OpportunityResponsiblesDropdown from './OpportunityResponsiblesDropdown.vue';
import OpportunityStatusDropdown from './OpportunityStatusDropdown.vue';
import OpportunityWorkflowActionRow from './OpportunityWorkflowActionRow.vue';
import OpportunityWorkflowChangeDialog from './OpportunityWorkflowChangeDialog.vue';
import OpportunityControlQuestionsSection from './OpportunityControlQuestionsSection.vue';
import OpportunityCustomFieldsSection from './OpportunityCustomFieldsSection.vue';
import OpportunityDetailsSection from './OpportunityDetailsSection.vue';
import OpportunitySummariesSection from './OpportunitySummariesSection.vue';
import OpportunityAttachmentsSection from './OpportunityAttachmentsSection.vue';
import {
  useOpportunityControlQuestionsQuery,
  useOpportunityCustomFieldsQuery,
  useOpportunitySummariesQuery,
} from '../composables/api/useOpportunityQualificationQueries';
import { useOpportunityAttachmentsQuery } from '../composables/api/useOpportunityAttachmentsQuery';
import type { OpportunityDetailSection } from '../opportunity-detail.types';

const props = defineProps<{
  opportunity: OpportunityDto;
  pipeline?: PipelineDto;
  workflows: WorkflowDto[];
  members: AccountMemberDto[];
  section: OpportunityDetailSection;
}>();

const opportunityId = computed(() => props.opportunity.id);
const hasWorkflow = computed(() => Boolean(props.opportunity.workflowId));
const {
  data: runtime,
  isLoading: isWorkflowLoading,
  isError: isWorkflowError,
  refetch: refetchWorkflow,
} = useOpportunityWorkflowQuery(opportunityId, hasWorkflow);
const { mutate: assignWorkflow, isPending: isAssigning } = useAssignOpportunityWorkflowMutation();
const { mutate: reEvaluate, isPending: isReEvaluating } = useReEvaluateWorkflowDecisionMutation();
const { data: controlQuestions } = useOpportunityControlQuestionsQuery(opportunityId);
const { data: customFields } = useOpportunityCustomFieldsQuery(opportunityId);
const { data: summaries } = useOpportunitySummariesQuery(opportunityId);
const { data: attachments } = useOpportunityAttachmentsQuery(opportunityId);

type NavigationItem = {
  id: OpportunityDetailSection;
  label: string;
  icon: Component;
  count?: number;
};

const navigationGroups = computed<{ label: string; items: NavigationItem[] }[]>(() => [
  {
    label: 'Oportunidad',
    items: [
      { id: 'details', label: 'Detalles', icon: InfoIcon },
      { id: 'attachments', label: 'Documentación', icon: PaperclipIcon, count: attachments.value?.length },
    ],
  },
  {
    label: 'Cualificación inteligente',
    items: [
      {
        id: 'control-questions',
        label: 'Preguntas de control',
        icon: CircleHelpIcon,
        count: controlQuestions.value?.length,
      },
      { id: 'custom-fields', label: 'Campos personalizados', icon: ListChecksIcon, count: customFields.value?.length },
      { id: 'summaries', label: 'Resúmenes', icon: SparklesIcon, count: summaries.value?.length },
    ],
  },
  {
    label: 'Proceso',
    items: [{ id: 'workflow', label: 'Workflow', icon: GitBranchIcon }],
  },
]);

const selectedWorkflowId = ref('');
const selectedStepId = ref('');
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const isWorkflowDialogOpen = ref(false);
const currentStep = computed(() =>
  runtime.value?.workflow.steps.find((step) => step.id === runtime.value?.currentStepId),
);
const selectedStep = computed(() => runtime.value?.workflow.steps.find((step) => step.id === selectedStepId.value));
const selectedDecision = computed(() =>
  runtime.value?.decisions.find((decision) => decision.workflowStepId === selectedStepId.value),
);
const selectedStepActions = computed(() => {
  if (!selectedStep.value || !runtime.value) return [];
  const runtimeActions = runtime.value.actions.filter((action) => action.workflowStepId === selectedStep.value?.id);

  return selectedStep.value.actions.map((definition) => ({
    definition,
    action: runtimeActions.find((action) => action.defaultWorkflowStepActionId === definition.id),
  }));
});
const currentStepPosition = computed(() => currentStep.value?.position ?? 0);
const overallProgress = computed(() => {
  const steps = runtime.value?.workflow.steps ?? [];
  const total = steps.reduce((sum, step) => sum + stepProgress(step).total, 0);
  const completed = steps.reduce((sum, step) => sum + stepProgress(step).completed, 0);
  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
});

watch(
  () => runtime.value?.currentStepId,
  (stepId) => {
    if (stepId && !selectedStepId.value) selectedStepId.value = stepId;
  },
  { immediate: true },
);

const formattedAmount = computed(() => {
  if (props.opportunity.amount == null) return 'Sin importe';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: props.opportunity.currency ?? 'EUR',
    maximumFractionDigits: 0,
  }).format(props.opportunity.amount);
});

function handleAssign(): void {
  if (!selectedWorkflowId.value) return;
  assignWorkflow(
    {
      opportunityId: props.opportunity.id,
      workflowId: selectedWorkflowId.value,
      replace: hasWorkflow.value,
    },
    {
      onSuccess: () => {
        toast.success(hasWorkflow.value ? 'Workflow cambiado' : 'Workflow asignado');
        selectedWorkflowId.value = '';
      },
      onError: () => toast.error('No se pudo asignar el workflow'),
    },
  );
}

function handleReEvaluate(): void {
  if (!selectedStep.value || selectedStep.value.id !== runtime.value?.currentStepId) return;
  reEvaluate(
    { opportunityId: props.opportunity.id, workflowStepId: selectedStep.value.id },
    {
      onSuccess: () => toast.success('Reevaluación solicitada'),
      onError: () => toast.error('No se pudo solicitar la reevaluación'),
    },
  );
}

function stepProgress(step: WorkflowStepDto): { completed: number; total: number; percentage: number } {
  const runtimeActions = (runtime.value?.actions ?? []).filter((action) => action.workflowStepId === step.id);
  const decision = runtime.value?.decisions.find((item) => item.workflowStepId === step.id);
  const actionTotal = step.actions.length;
  const decisionTotal = step.type === 'decision' ? 1 : 0;
  const total = Math.max(1, actionTotal + decisionTotal);
  const settledActions = runtimeActions.filter((action) => ['COMPLETED', 'SKIPPED'].includes(action.status)).length;
  const settledDecision = decision?.status === 'TRUE' || decision?.status === 'FALSE' ? 1 : 0;
  const isPastStep = step.position < currentStepPosition.value;
  const isCompletedCurrent = runtime.value?.status === 'COMPLETED' && step.id === runtime.value.currentStepId;
  const completed = isPastStep || isCompletedCurrent ? total : Math.min(total, settledActions + settledDecision);

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
}

function stepState(step: WorkflowStepDto): 'completed' | 'current' | 'upcoming' {
  if (step.position < currentStepPosition.value) return 'completed';
  if (step.id === runtime.value?.currentStepId && runtime.value.status === 'COMPLETED') return 'completed';
  if (step.id === runtime.value?.currentStepId) return 'current';
  return 'upcoming';
}

function selectStep(step: WorkflowStepDto): void {
  selectedStepId.value = step.id;
}

function actionFor(definition: DefaultWorkflowStepActionDto): WorkflowStepActionDto | undefined {
  return runtime.value?.actions.find(
    (action) => action.defaultWorkflowStepActionId === definition.id && action.workflowStepId === selectedStepId.value,
  );
}

function selectSection(section: OpportunityDetailSection): void {
  void navigateTo({ path: `/opportunities/${props.opportunity.id}`, query: { section } });
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <header class="shrink-0 border-b bg-background">
      <div class="flex items-center gap-3 px-5 py-4">
        <Button
          variant="ghost"
          size="icon"
          class="size-8"
          @click="navigateTo(`/opportunities/kanban/${opportunity.pipelineId}`)"
        >
          <ArrowLeftIcon class="size-4" />
        </Button>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h1 class="truncate text-lg font-semibold">{{ opportunity.title }}</h1>
            <OpportunityStatusDropdown :opportunity="opportunity" :pipeline="pipeline" />
          </div>
          <p class="mt-1 text-sm text-muted-foreground">{{ formattedAmount }}</p>
        </div>
        <OpportunityResponsiblesDropdown :opportunity="opportunity" :members="members" />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" aria-label="Acciones de oportunidad">
              <MoreHorizontalIcon class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem @click="isEditOpen = true">
              <PencilIcon class="mr-2 size-4" />
              Editar oportunidad
            </DropdownMenuItem>
            <DropdownMenuItem @click="isWorkflowDialogOpen = true">
              <GitBranchIcon class="mr-2 size-4" />
              {{ opportunity.workflowId ? 'Cambiar workflow' : 'Asignar workflow' }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive focus:text-destructive" @click="isDeleteOpen = true">
              <Trash2Icon class="mr-2 size-4" />
              Eliminar oportunidad
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <main class="min-h-0 flex-1 overflow-y-auto p-5 md:overflow-hidden">
      <div
        class="mx-auto grid min-h-full max-w-[1500px] gap-5 md:h-full md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <aside class="hidden md:block">
          <Card class="sticky top-0 overflow-hidden">
            <CardHeader class="border-b pb-4">
              <div class="flex items-center gap-2">
                <span class="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                  <BotIcon class="size-4" />
                </span>
                <div>
                  <CardTitle class="text-sm">Oportunidad</CardTitle>
                  <CardDescription class="text-xs">Navegación contextual</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-5 p-3">
              <div v-for="group in navigationGroups" :key="group.label">
                <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {{ group.label }}
                </p>
                <nav class="space-y-1" :aria-label="group.label">
                  <button
                    v-for="item in group.items"
                    :key="item.id"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
                    :class="
                      section === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    "
                    :aria-current="section === item.id ? 'page' : undefined"
                    @click="selectSection(item.id)"
                  >
                    <component :is="item.icon" class="size-4 shrink-0" />
                    <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                    <Badge
                      v-if="item.count !== undefined"
                      :variant="section === item.id ? 'outline' : 'secondary'"
                      class="min-w-6 justify-center px-1.5"
                    >
                      {{ item.count }}
                    </Badge>
                  </button>
                </nav>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section class="min-w-0 lg:min-h-0">
          <Select :model-value="section" @update:model-value="selectSection($event as OpportunityDetailSection)">
            <SelectTrigger class="mb-5 md:hidden"><SelectValue placeholder="Selecciona una sección" /></SelectTrigger>
            <SelectContent>
              <template v-for="group in navigationGroups" :key="group.label">
                <SelectLabel>{{ group.label }}</SelectLabel>
                <SelectItem v-for="item in group.items" :key="item.id" :value="item.id">
                  {{ item.label }}
                </SelectItem>
              </template>
            </SelectContent>
          </Select>

          <div v-if="section !== 'workflow'" class="pb-8 lg:h-full lg:overflow-y-auto lg:pr-1">
            <OpportunityDetailsSection
              v-if="section === 'details'"
              :opportunity="opportunity"
              :pipeline="pipeline"
              @edit="isEditOpen = true"
            />
            <OpportunityControlQuestionsSection
              v-else-if="section === 'control-questions'"
              :opportunity-id="opportunity.id"
            />
            <OpportunityAttachmentsSection v-else-if="section === 'attachments'" :opportunity-id="opportunity.id" />
            <OpportunityCustomFieldsSection v-else-if="section === 'custom-fields'" :opportunity-id="opportunity.id" />
            <OpportunitySummariesSection v-else-if="section === 'summaries'" :opportunity-id="opportunity.id" />
          </div>

          <template v-else>
            <Card v-if="!hasWorkflow" class="mx-auto max-w-2xl">
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
                <CardDescription>Asigna un workflow para comenzar.</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4 rounded-lg border border-dashed p-5 text-center">
                  <p class="text-sm text-muted-foreground">Esta oportunidad todavía no tiene un proceso asignado.</p>
                  <div class="mx-auto flex max-w-md gap-2">
                    <Select v-model="selectedWorkflowId">
                      <SelectTrigger><SelectValue placeholder="Selecciona un workflow" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="workflow in workflows" :key="workflow.id" :value="workflow.id">
                          {{ workflow.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button :disabled="!selectedWorkflowId || isAssigning" @click="handleAssign">Asignar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div
              v-else-if="isWorkflowLoading"
              class="flex h-full items-center justify-center text-sm text-muted-foreground"
            >
              Cargando workflow...
            </div>

            <QueryErrorState
              v-else-if="isWorkflowError"
              class="mx-auto max-w-2xl"
              message="No se pudo cargar el workflow de la oportunidad."
              @retry="refetchWorkflow()"
            />

            <div
              v-else-if="runtime"
              class="min-h-full rounded-xl border bg-background lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[360px_minmax(0,1fr)] lg:overflow-hidden"
            >
              <aside class="border-b bg-muted/10 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
                <div class="z-10 border-b bg-background/95 p-5 backdrop-blur lg:sticky lg:top-0">
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <h2 class="font-semibold">Workflow</h2>
                      <p class="truncate text-sm text-muted-foreground">{{ runtime.workflow.name }}</p>
                    </div>
                    <span class="shrink-0 text-sm text-muted-foreground">{{ overallProgress.percentage }}%</span>
                  </div>
                  <div class="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      class="h-full rounded-full bg-primary transition-all"
                      :style="{ width: `${overallProgress.percentage}%` }"
                    />
                  </div>
                </div>

                <div class="relative p-4">
                  <div class="absolute bottom-10 left-[43px] top-10 w-px bg-border" />
                  <button
                    v-for="step in runtime.workflow.steps"
                    :key="step.id"
                    type="button"
                    class="relative mb-2 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-all last:mb-0 hover:bg-muted/60"
                    :class="selectedStepId === step.id ? 'border bg-background shadow-sm' : 'border border-transparent'"
                    @click="selectStep(step)"
                  >
                    <span
                      class="z-[1] flex size-12 shrink-0 items-center justify-center rounded-full border-4 text-sm font-semibold"
                      :class="{
                        'border-emerald-500 bg-emerald-500 text-white': stepState(step) === 'completed',
                        'border-primary/20 bg-primary text-primary-foreground': stepState(step) === 'current',
                        'border-muted bg-background text-muted-foreground': stepState(step) === 'upcoming',
                      }"
                    >
                      <CheckCircle2Icon v-if="stepState(step) === 'completed'" class="size-5" />
                      <span v-else>{{ step.position }}</span>
                    </span>

                    <span class="min-w-0 flex-1">
                      <span class="flex items-center justify-between gap-2">
                        <span class="truncate text-sm font-medium">{{ step.name }}</span>
                        <ChevronRightIcon
                          v-if="selectedStepId === step.id"
                          class="size-4 shrink-0 text-muted-foreground"
                        />
                      </span>
                      <span class="mt-2 flex items-center gap-2">
                        <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <span
                            class="block h-full rounded-full transition-all"
                            :class="stepState(step) === 'completed' ? 'bg-emerald-500' : 'bg-primary'"
                            :style="{ width: `${stepProgress(step).percentage}%` }"
                          />
                        </span>
                        <span class="text-xs text-muted-foreground">
                          {{ stepProgress(step).completed }}/{{ stepProgress(step).total }}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>
              </aside>

              <section v-if="selectedStep" class="lg:min-h-0 lg:overflow-y-auto">
                <header class="z-10 border-b bg-background/95 px-5 py-5 backdrop-blur lg:sticky lg:top-0">
                  <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Step {{ selectedStep.position }}
                      </p>
                      <h2 class="mt-1 text-2xl font-semibold">{{ selectedStep.name }}</h2>
                      <p v-if="selectedStep.condition" class="mt-1 text-sm text-muted-foreground">
                        {{ selectedStep.condition }}
                      </p>
                    </div>
                    <Badge :variant="stepState(selectedStep) === 'current' ? 'default' : 'secondary'">
                      {{
                        stepState(selectedStep) === 'completed'
                          ? 'Completado'
                          : stepState(selectedStep) === 'current'
                            ? 'Step actual'
                            : 'Próximo'
                      }}
                    </Badge>
                  </div>

                  <div class="mt-5 flex items-center gap-4">
                    <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        class="h-full rounded-full bg-primary transition-all"
                        :style="{ width: `${stepProgress(selectedStep).percentage}%` }"
                      />
                    </div>
                    <span class="shrink-0 text-sm text-muted-foreground">
                      {{ stepProgress(selectedStep).completed }}/{{ stepProgress(selectedStep).total }}
                    </span>
                  </div>
                </header>

                <div
                  v-if="selectedStep.type === 'decision'"
                  class="flex flex-wrap items-center justify-between gap-4 border-b bg-amber-500/5 px-5 py-4"
                >
                  <div>
                    <p class="text-sm font-medium">Decisión: {{ selectedDecision?.status ?? 'PENDING' }}</p>
                    <p class="mt-1 text-sm text-muted-foreground">
                      {{ selectedDecision?.evidence ?? 'Todavía no hay evidencia disponible.' }}
                    </p>
                  </div>
                  <Button
                    v-if="selectedStep.id === runtime.currentStepId"
                    variant="outline"
                    size="sm"
                    :disabled="isReEvaluating"
                    @click="handleReEvaluate"
                  >
                    <RotateCcwIcon class="mr-2 size-4" />
                    Reevaluar
                  </Button>
                </div>

                <div v-if="selectedStepActions.length" class="border-t">
                  <OpportunityWorkflowActionRow
                    v-for="{ definition } in selectedStepActions"
                    :key="definition.id"
                    :definition="definition"
                    :action="actionFor(definition)"
                    :is-current-step="selectedStep.id === runtime.currentStepId"
                    :opportunity-id="opportunity.id"
                  />
                </div>

                <div v-else class="p-10 text-center">
                  <CircleIcon class="mx-auto size-8 text-muted-foreground/50" />
                  <p class="mt-3 text-sm font-medium">Este step no tiene acciones</p>
                  <p class="mt-1 text-sm text-muted-foreground">
                    El workflow avanzará automáticamente cuando corresponda.
                  </p>
                </div>
              </section>
            </div>
          </template>
        </section>
      </div>
    </main>

    <OpportunityEditDialog v-model:open="isEditOpen" :opportunity="opportunity" />
    <OpportunityDeleteDialog v-model:open="isDeleteOpen" :opportunity="opportunity" />
    <OpportunityWorkflowChangeDialog
      v-model:open="isWorkflowDialogOpen"
      :opportunity="opportunity"
      :workflows="workflows"
    />
  </div>
</template>
