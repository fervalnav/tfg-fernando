<script setup lang="ts">
import type { OpportunityDto } from '@tfg/types';
import { LoaderCircleIcon, Trash2Icon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useDeleteOpportunityMutation } from '../composables/api/useDeleteOpportunityMutation';

const props = defineProps<{ opportunity: OpportunityDto }>();
const open = defineModel<boolean>('open', { default: false });
const { mutate: deleteOpportunity, isPending } = useDeleteOpportunityMutation();

function handleDelete(): void {
  deleteOpportunity(props.opportunity.id, {
    onSuccess: () => {
      toast.success('Oportunidad eliminada');
      open.value = false;
      void navigateTo(`/opportunities/kanban/${props.opportunity.pipelineId}`);
    },
    onError: () => toast.error('No se pudo eliminar la oportunidad'),
  });
}
</script>

<template>
  <Dialog :open="open" @update:open="(isOpen) => (open = isOpen)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Eliminar oportunidad</DialogTitle>
        <DialogDescription>
          Se eliminará “{{ opportunity.title }}” de forma permanente. Esta acción no se puede deshacer.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" :disabled="isPending" @click="open = false">Cancelar</Button>
        <Button variant="destructive" :disabled="isPending" @click="handleDelete">
          <LoaderCircleIcon v-if="isPending" class="mr-2 size-4 animate-spin" />
          <Trash2Icon v-else class="mr-2 size-4" />
          Eliminar definitivamente
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
