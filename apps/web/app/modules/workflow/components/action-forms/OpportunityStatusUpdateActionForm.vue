<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import type { DefaultWorkflowStepActionDto } from '@tfg/types';
import { useWorkflowEditorContext } from '../../composables/useWorkflowEditorContext';
import { useCreateDefaultStepActionMutation } from '../../composables/api/useCreateDefaultStepActionMutation';
import { useUpdateDefaultStepActionMutation } from '../../composables/api/useUpdateDefaultStepActionMutation';
import { usePipelinesQuery } from '~/modules/pipeline';

const props = defineProps<{ editing?: DefaultWorkflowStepActionDto }>();
const emit = defineEmits<{ saved: []; cancel: [] }>();

const { workflowId, panelState, nextPosition } = useWorkflowEditorContext();

const stepId = computed(() => {
  const s = panelState.value;
  return s.mode !== 'closed' ? s.stepId : '';
});

const { mutate: create, isPending: isCreating } = useCreateDefaultStepActionMutation();
const { mutate: update, isPending: isUpdating } = useUpdateDefaultStepActionMutation();
const isPending = computed(() => isCreating.value || isUpdating.value);

const { data: pipelines } = usePipelinesQuery();

const schema = toTypedSchema(
  z.object({
    pipelineId: z.string().min(1, 'Selecciona un pipeline'),
    statusId: z.string().min(1, 'Selecciona un estado'),
  }),
);

const form = useForm({ validationSchema: schema });

onMounted(() => {
  if (props.editing) {
    form.setValues({
      pipelineId: (props.editing.metadata?.['pipelineId'] as string) ?? '',
      statusId: props.editing.targetId ?? '',
    });
  }
});

const selectedPipelineId = computed(() => form.values.pipelineId);
const statuses = computed(() => (pipelines.value ?? []).find((p) => p.id === selectedPipelineId.value)?.statuses ?? []);

const onSubmit = form.handleSubmit((values) => {
  const pipeline = (pipelines.value ?? []).find((p) => p.id === values.pipelineId);
  const status = statuses.value.find((s) => s.id === values.statusId);
  const name = `Mover a "${status?.name ?? 'estado'}" en ${pipeline?.name ?? 'pipeline'}`;
  const metadata = { pipelineId: values.pipelineId };

  if (props.editing) {
    update(
      {
        workflowId: workflowId.value,
        stepId: stepId.value,
        actionId: props.editing.id,
        name,
        targetType: 'opportunity_status_update',
        targetId: values.statusId,
        metadata,
        position: props.editing.position,
      },
      {
        onSuccess: () => {
          toast.success('Acción actualizada');
          emit('saved');
        },
        onError: () => toast.error('Error al actualizar'),
      },
    );
  } else {
    create(
      {
        workflowId: workflowId.value,
        stepId: stepId.value,
        id: uuidv7(),
        name,
        targetType: 'opportunity_status_update',
        targetId: values.statusId,
        metadata,
        position: nextPosition.value,
      },
      {
        onSuccess: () => {
          toast.success('Acción añadida');
          emit('saved');
        },
        onError: () => toast.error('Error al añadir'),
      },
    );
  }
});
</script>

<template>
  <form class="flex flex-col h-full" @submit="onSubmit">
    <div class="flex-1 p-4 space-y-4">
      <FormField v-slot="{ componentField }" name="pipelineId">
        <FormItem>
          <FormLabel>Pipeline</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger><SelectValue placeholder="Selecciona un pipeline" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="p in pipelines ?? []" :key="p.id" :value="p.id">
                {{ p.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-if="selectedPipelineId" v-slot="{ componentField }" name="statusId">
        <FormItem>
          <FormLabel>Estado destino</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="s in statuses" :key="s.id" :value="s.id">
                {{ s.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <div class="p-4 border-t flex gap-2">
      <Button type="button" variant="outline" size="sm" class="flex-1" @click="emit('cancel')">Cancelar</Button>
      <Button type="submit" size="sm" class="flex-1" :disabled="isPending">
        {{ isPending ? 'Guardando...' : editing ? 'Guardar cambios' : 'Añadir acción' }}
      </Button>
    </div>
  </form>
</template>
