<script setup lang="ts">
import type { OpportunityDto, WorkflowDto } from '@tfg/types';
import { LoaderCircleIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useAssignOpportunityWorkflowMutation } from '../composables/api/useOpportunityWorkflowMutations';

const props = defineProps<{
  opportunity: OpportunityDto;
  workflows: WorkflowDto[];
}>();

const open = defineModel<boolean>('open', { default: false });
const selectedWorkflowId = ref('');
const { mutate: assignWorkflow, isPending } = useAssignOpportunityWorkflowMutation();

const availableWorkflows = computed(() =>
  props.workflows.filter((workflow) => workflow.id !== props.opportunity.workflowId),
);

watch(open, (isOpen) => {
  if (isOpen) selectedWorkflowId.value = '';
});

function handleChange(): void {
  if (!selectedWorkflowId.value) return;
  assignWorkflow(
    {
      opportunityId: props.opportunity.id,
      workflowId: selectedWorkflowId.value,
      replace: Boolean(props.opportunity.workflowId),
    },
    {
      onSuccess: () => {
        toast.success(props.opportunity.workflowId ? 'Workflow cambiado' : 'Workflow asignado');
        open.value = false;
      },
      onError: () => toast.error('No se pudo cambiar el workflow'),
    },
  );
}
</script>

<template>
  <Dialog :open="open" @update:open="(isOpen) => (open = isOpen)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ opportunity.workflowId ? 'Cambiar workflow' : 'Asignar workflow' }}</DialogTitle>
        <DialogDescription>
          {{
            opportunity.workflowId
              ? 'El progreso actual se sustituirá por una nueva ejecución desde el primer step.'
              : 'La ejecución comenzará en el primer step del workflow seleccionado.'
          }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-2">
        <Label>Workflow</Label>
        <Select v-model="selectedWorkflowId">
          <SelectTrigger><SelectValue placeholder="Selecciona un workflow" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="workflow in availableWorkflows" :key="workflow.id" :value="workflow.id">
              {{ workflow.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="!availableWorkflows.length" class="text-sm text-muted-foreground">No hay otro workflow disponible.</p>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="isPending" @click="open = false">Cancelar</Button>
        <Button :disabled="!selectedWorkflowId || isPending" @click="handleChange">
          <LoaderCircleIcon v-if="isPending" class="mr-2 size-4 animate-spin" />
          {{ opportunity.workflowId ? 'Cambiar workflow' : 'Asignar workflow' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
