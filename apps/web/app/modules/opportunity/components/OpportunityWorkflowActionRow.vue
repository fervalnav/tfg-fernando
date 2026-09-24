<script setup lang="ts">
import type { Component } from 'vue';
import type { ActionTargetType, DefaultWorkflowStepActionDto, WorkflowStepActionDto } from '@tfg/types';
import {
  BellIcon,
  BotIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleDotIcon,
  FileTextIcon,
  ListChecksIcon,
  LoaderCircleIcon,
  PaperclipIcon,
  RotateCcwIcon,
  SkipForwardIcon,
  SparklesIcon,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useWorkflowActionMutation } from '../composables/api/useOpportunityWorkflowMutations';
import OpportunityQualificationActionContent from './OpportunityQualificationActionContent.vue';
import OpportunityAttachmentActionContent from './OpportunityAttachmentActionContent.vue';

const props = defineProps<{
  definition: DefaultWorkflowStepActionDto;
  action?: WorkflowStepActionDto;
  isCurrentStep: boolean;
  opportunityId: string;
}>();

const isExpanded = ref(false);
const { mutate: updateAction, isPending } = useWorkflowActionMutation();

const actionTypeDefinitions: Record<ActionTargetType, { label: string; executor: string; icon: Component }> = {
  control_question: { label: 'Pregunta de control', executor: 'Agente', icon: CircleDotIcon },
  custom_field: { label: 'Campo personalizado', executor: 'Agente', icon: ListChecksIcon },
  summary: { label: 'Resumen', executor: 'Agente', icon: SparklesIcon },
  task: { label: 'Tarea', executor: 'Manual', icon: CheckIcon },
  attachment: { label: 'Adjunto', executor: 'Manual', icon: PaperclipIcon },
  email_notification: { label: 'Notificación', executor: 'Automática', icon: BellIcon },
  opportunity_status_update: { label: 'Cambio de estado', executor: 'Automática', icon: FileTextIcon },
};

const typeDefinition = computed(() => actionTypeDefinitions[props.definition.targetType]);
const status = computed(() => props.action?.status ?? 'BLOCKED');
const canSkip = computed(
  () =>
    props.isCurrentStep &&
    Boolean(props.action) &&
    !['COMPLETED', 'SKIPPED', 'IN_PROGRESS'].includes(props.action?.status ?? ''),
);
const canComplete = computed(
  () => canSkip.value && props.action?.status !== 'FAILED' && props.definition.targetType !== 'attachment',
);

const statusLabel = computed(() => {
  if (status.value === 'COMPLETED') return 'Completada';
  if (status.value === 'SKIPPED') return 'Omitida';
  if (status.value === 'IN_PROGRESS') return 'En progreso';
  if (status.value === 'FAILED') return 'Con error';
  if (status.value === 'PENDING') return 'Pendiente';
  return 'Bloqueada';
});

const statusClass = computed(() => {
  if (status.value === 'COMPLETED') return 'text-emerald-600';
  if (status.value === 'SKIPPED') return 'text-muted-foreground';
  if (status.value === 'IN_PROGRESS') return 'text-blue-600';
  if (status.value === 'FAILED') return 'text-destructive';
  return 'text-muted-foreground';
});

const futureSprintLabel = computed(() => {
  const type = props.definition.targetType;
  if (type === 'task') return 'El contenido específico de esta acción se conectará en un sprint posterior.';
  if (type === 'email_notification') return 'El detalle del envío automático se conectará en un sprint posterior.';
  return 'Esta acción actualiza automáticamente el estado de la oportunidad.';
});

function run(operation: 'complete' | 'skip' | 'retry'): void {
  if (!props.action) return;
  updateAction(
    {
      opportunityId: props.action.opportunityId,
      actionId: props.action.id,
      operation,
    },
    {
      onSuccess: () => {
        toast.success(
          operation === 'skip'
            ? 'Acción omitida'
            : operation === 'retry'
              ? 'Reintento solicitado'
              : 'Acción completada',
        );
      },
      onError: () => toast.error('No se pudo actualizar la acción'),
    },
  );
}
</script>

<template>
  <article class="border-b last:border-b-0">
    <button
      type="button"
      class="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
      :aria-expanded="isExpanded"
      @click="isExpanded = !isExpanded"
    >
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-full"
        :class="
          status === 'COMPLETED'
            ? 'bg-emerald-500 text-white'
            : status === 'IN_PROGRESS'
              ? 'bg-blue-500/10 text-blue-600'
              : 'bg-muted text-muted-foreground'
        "
      >
        <LoaderCircleIcon v-if="status === 'IN_PROGRESS'" class="size-4 animate-spin" />
        <component :is="typeDefinition.icon" v-else class="size-4" />
      </span>

      <span class="min-w-0 flex-1 font-medium">{{ definition.name }}</span>

      <span class="hidden items-center gap-1.5 text-sm font-medium sm:flex" :class="statusClass">
        <CheckIcon v-if="status === 'COMPLETED'" class="size-4" />
        {{ statusLabel }}
      </span>

      <Badge variant="secondary" class="hidden gap-1.5 rounded-full md:flex">
        <BotIcon v-if="typeDefinition.executor === 'Agente'" class="size-3.5 text-violet-500" />
        {{ typeDefinition.executor }}
      </Badge>

      <ChevronDownIcon
        class="size-4 shrink-0 text-muted-foreground transition-transform"
        :class="isExpanded ? 'rotate-180' : ''"
      />
    </button>

    <div v-if="isExpanded" class="border-t bg-muted/15 px-5 py-5 sm:pl-20">
      <div class="space-y-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo de acción</p>
          <p class="mt-1 text-sm">{{ typeDefinition.label }}</p>
        </div>

        <div v-if="!action" class="rounded-lg border border-dashed bg-background p-4">
          <p class="text-sm font-medium">Acción todavía no disponible</p>
          <p class="mt-1 text-sm text-muted-foreground">Se habilitará cuando la oportunidad alcance este step.</p>
        </div>

        <div v-else-if="action.errorMessage" class="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p class="text-sm font-medium text-destructive">La ejecución ha fallado</p>
          <p class="mt-1 text-sm text-muted-foreground">{{ action.errorMessage }}</p>
        </div>

        <OpportunityQualificationActionContent
          v-if="action && ['control_question', 'custom_field', 'summary'].includes(definition.targetType)"
          :opportunity-id="opportunityId"
          :definition="definition"
          :action="action"
        />

        <OpportunityAttachmentActionContent
          v-else-if="action && definition.targetType === 'attachment'"
          :opportunity-id="opportunityId"
          :definition="definition"
          :action="action"
        />

        <div v-else class="rounded-lg border bg-background p-4">
          <p class="text-sm text-muted-foreground">{{ futureSprintLabel }}</p>
        </div>

        <div v-if="canSkip && action" class="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" :disabled="isPending" @click.stop="run('skip')">
            <SkipForwardIcon class="mr-2 size-4" />
            Omitir
          </Button>
          <Button
            v-if="action.status === 'FAILED'"
            variant="outline"
            size="sm"
            :disabled="isPending"
            @click.stop="run('retry')"
          >
            <RotateCcwIcon class="mr-2 size-4" />
            Reintentar
          </Button>
          <Button v-if="canComplete" size="sm" :disabled="isPending" @click.stop="run('complete')">
            <CheckIcon class="mr-2 size-4" />
            Completar
          </Button>
        </div>
      </div>
    </div>
  </article>
</template>
