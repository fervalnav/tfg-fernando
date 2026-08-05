<script setup lang="ts">
import { DownloadIcon, FileTextIcon, PaperclipIcon, Trash2Icon, UploadIcon } from 'lucide-vue-next';
import { v7 as uuidv7 } from 'uuid';
import { toast } from 'vue-sonner';
import { useOpportunityAttachmentsQuery } from '../composables/api/useOpportunityAttachmentsQuery';
import {
  useDeleteOpportunityAttachmentMutation,
  useDownloadOpportunityAttachmentMutation,
  useUploadOpportunityAttachmentMutation,
} from '../composables/api/useOpportunityAttachmentMutations';
import { validatePdfFile } from '~/modules/shared/lib/formValidation';

const props = defineProps<{ opportunityId: string }>();
const selectedFile = ref<File>();
const fileInputKey = ref(0);
const { data: attachments, isLoading, isError, refetch } = useOpportunityAttachmentsQuery(() => props.opportunityId);
const { mutate: upload, isPending: isUploading } = useUploadOpportunityAttachmentMutation();
const { mutate: remove, isPending: isDeleting } = useDeleteOpportunityAttachmentMutation();
const { mutate: download } = useDownloadOpportunityAttachmentMutation();

function selectFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    selectedFile.value = undefined;
    return;
  }

  const validationError = validatePdfFile(file);
  if (validationError) {
    selectedFile.value = undefined;
    input.value = '';
    toast.error(validationError);
    return;
  }

  selectedFile.value = file;
}

function uploadFile(): void {
  if (!selectedFile.value) return;
  upload(
    { id: uuidv7(), opportunityId: props.opportunityId, file: selectedFile.value },
    {
      onSuccess: () => {
        selectedFile.value = undefined;
        fileInputKey.value += 1;
        toast.success('Documento adjuntado');
      },
      onError: () => toast.error('No se pudo adjuntar el documento'),
    },
  );
}

function downloadFile(attachmentId: string): void {
  download(
    { opportunityId: props.opportunityId, attachmentId },
    {
      onSuccess: ({ url }) => window.open(url, '_blank', 'noopener,noreferrer'),
      onError: () => toast.error('No se pudo descargar el documento'),
    },
  );
}

function deleteFile(attachmentId: string): void {
  remove(
    { opportunityId: props.opportunityId, attachmentId },
    {
      onSuccess: () => toast.success('Documento eliminado'),
      onError: () => toast.error('No se pudo eliminar el documento'),
    },
  );
}

function formatSize(size: number): string {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(size / 1024 / 1024) + ' MB';
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle>Documentación</CardTitle>
          <CardDescription>PDFs que la IA utilizará para analizar esta oportunidad.</CardDescription>
        </div>
        <Badge variant="secondary">{{ attachments?.length ?? 0 }} documentos</Badge>
      </div>
    </CardHeader>
    <CardContent class="space-y-5">
      <div class="rounded-lg border border-dashed p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="flex-1 space-y-2">
            <Label for="opportunity-attachment">Selecciona un PDF (máximo 30 MB)</Label>
            <Input
              id="opportunity-attachment"
              :key="fileInputKey"
              type="file"
              accept="application/pdf,.pdf"
              @change="selectFile"
            />
          </div>
          <Button :disabled="!selectedFile || isUploading" @click="uploadFile">
            <UploadIcon class="mr-2 size-4" />
            {{ isUploading ? 'Subiendo...' : 'Adjuntar' }}
          </Button>
        </div>
      </div>

      <p v-if="isLoading" class="py-8 text-center text-sm text-muted-foreground">Cargando documentación...</p>
      <QueryErrorState v-else-if="isError" message="No se pudo cargar la documentación." @retry="refetch()" />
      <div v-else-if="attachments?.length" class="divide-y rounded-lg border">
        <div v-for="attachment in attachments" :key="attachment.id" class="flex items-center gap-3 p-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
            <FileTextIcon class="size-5" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ attachment.name }}</p>
            <p class="text-xs text-muted-foreground">{{ formatSize(attachment.size) }}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Descargar" @click="downloadFile(attachment.id)">
            <DownloadIcon class="size-4" />
          </Button>
          <Button
            v-if="!attachment.workflowStepActionId"
            variant="ghost"
            size="icon"
            class="text-destructive"
            aria-label="Eliminar"
            :disabled="isDeleting"
            @click="deleteFile(attachment.id)"
          >
            <Trash2Icon class="size-4" />
          </Button>
        </div>
      </div>
      <div v-else class="rounded-lg border border-dashed py-12 text-center">
        <PaperclipIcon class="mx-auto size-8 text-muted-foreground/50" />
        <p class="mt-3 text-sm font-medium">Todavía no hay documentación</p>
        <p class="mt-1 text-sm text-muted-foreground">Adjunta el PCAP y el PPTP antes de ejecutar el análisis.</p>
      </div>
    </CardContent>
  </Card>
</template>
