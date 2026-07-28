<script setup lang="ts">
import type { FinalOutcomeType, OpportunityDto, PipelineDto, PipelineStatusDto } from '@tfg/types';
import { CheckIcon, ChevronDownIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useTransitionStatusMutation } from '../composables/api/useTransitionStatusMutation';

const props = defineProps<{
  opportunity: OpportunityDto;
  pipeline?: PipelineDto;
}>();

const { mutate: transitionStatus, isPending } = useTransitionStatusMutation();
const currentStatus = computed(() =>
  props.pipeline?.statuses.find((status) => status.id === props.opportunity.pipelineStatusId),
);

function handleStatusChange(status: PipelineStatusDto): void {
  if (status.id === props.opportunity.pipelineStatusId) return;
  const finalOutcomeType: FinalOutcomeType | undefined = status.outcomeType === 'NONE' ? undefined : status.outcomeType;
  transitionStatus(
    {
      id: props.opportunity.id,
      pipelineStatusId: status.id,
      finalOutcomeType,
      sortPoints: props.opportunity.sortPoints,
    },
    {
      onSuccess: () => toast.success(`Estado actualizado a ${status.name}`),
      onError: () => toast.error('No se pudo cambiar el estado'),
    },
  );
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="h-7 gap-1.5 rounded-full px-2.5" :disabled="isPending">
        <span class="size-2 rounded-full" :style="{ backgroundColor: currentStatus?.backgroundColor ?? '#94a3b8' }" />
        {{ currentStatus?.name ?? 'Sin estado' }}
        <ChevronDownIcon class="size-3.5 text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="min-w-56">
      <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="status in pipeline?.statuses ?? []"
        :key="status.id"
        class="gap-2"
        :disabled="status.id === opportunity.pipelineStatusId"
        @click="handleStatusChange(status)"
      >
        <span class="size-2 rounded-full" :style="{ backgroundColor: status.backgroundColor ?? '#94a3b8' }" />
        <span class="flex-1">{{ status.name }}</span>
        <CheckIcon v-if="status.id === opportunity.pipelineStatusId" class="size-4" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
