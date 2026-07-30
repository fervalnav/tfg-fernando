<script setup lang="ts">
import { CheckCircle2Icon, UploadIcon } from 'lucide-vue-next';
import { v7 as uuidv7 } from 'uuid';
import { toast } from 'vue-sonner';
import type { DefaultWorkflowStepActionDto, WorkflowStepActionDto } from '@tfg/types';
import { useUploadOpportunityAttachmentMutation } from '../composables/api/useOpportunityAttachmentMutations';

const props = defineProps<{
  opportunityId: string;
  definition: DefaultWorkflowStepActionDto;
  action: WorkflowStepActionDto;
}>();
const selectedFile = ref<File>();
const { mutate: upload, isPending } = useUploadOpportunityAttachmentMutation();
const expectedLabel = computed(() => {
  const label = props.definition.metadata?.['label'];
  return typeof label === 'string' ? label : 'documento requerido';
});

function selectFile(event: Event): void {
  selectedFile.value = (event.target as HTMLInputElement).files?.[0];
}

function submit(): void {
  if (!selectedFile.value) return;
  upload(
    {
      id: uuidv7(),
      opportunityId: props.opportunityId,
      workflowStepActionId: props.action.id,
      file: selectedFile.value,
    },
    {
      onSuccess: () => toast.success(`${expectedLabel.value} adjuntado`),
      onError: () => toast.error('No se pudo adjuntar el documento'),
    },
  );
}
</script>

<template>
  <div v-if="action.status === 'COMPLETED'" class="flex items-center gap-3 rounded-lg border bg-emerald-500/5 p-4">
    <CheckCircle2Icon class="size-5 text-emerald-600" />
    <div>
      <p class="text-sm font-medium">Documento adjuntado</p>
      <p class="text-sm text-muted-foreground">La IA podrá utilizar {{ expectedLabel }} en los siguientes pasos.</p>
    </div>
  </div>
  <div v-else class="space-y-3 rounded-lg border bg-background p-4">
    <div>
      <p class="text-sm font-medium">Adjuntar {{ expectedLabel }}</p>
      <p class="text-sm text-muted-foreground">Solo PDF, máximo 30 MB.</p>
    </div>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Input type="file" accept="application/pdf,.pdf" class="flex-1" @change="selectFile" />
      <Button :disabled="!selectedFile || isPending" @click="submit">
        <UploadIcon class="mr-2 size-4" />
        {{ isPending ? 'Subiendo...' : 'Adjuntar' }}
      </Button>
    </div>
  </div>
</template>
