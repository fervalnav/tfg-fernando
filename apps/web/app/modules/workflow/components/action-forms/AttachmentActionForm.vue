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
import { requiredString } from '~/modules/shared/lib/formValidation';

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

const schema = toTypedSchema(z.object({ label: requiredString('La etiqueta es obligatoria') }));

const form = useForm({ validationSchema: schema });

onMounted(() => {
  if (props.editing) {
    form.setValues({ label: (props.editing.metadata?.['label'] as string) ?? '' });
  }
});

const onSubmit = form.handleSubmit((values) => {
  const metadata = { label: values.label };

  if (props.editing) {
    update(
      {
        workflowId: workflowId.value,
        stepId: stepId.value,
        actionId: props.editing.id,
        name: values.label,
        targetType: 'attachment',
        targetId: undefined,
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
        name: values.label,
        targetType: 'attachment',
        targetId: undefined,
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
      <FormField v-slot="{ componentField }" name="label">
        <FormItem>
          <FormLabel>Nombre del documento</FormLabel>
          <FormControl>
            <Input placeholder="p.ej. Pliego de condiciones" v-bind="componentField" />
          </FormControl>
          <FormDescription>Este nombre identifica qué documento debe adjuntarse en este paso.</FormDescription>
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
