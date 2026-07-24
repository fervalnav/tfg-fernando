<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { v7 as uuidv7 } from 'uuid';
import { toast } from 'vue-sonner';
import type { WorkflowDto } from '@tfg/types';
import { useCreateWorkflowMutation } from '../composables/api/useCreateWorkflowMutation';
import { useUpdateWorkflowMutation } from '../composables/api/useUpdateWorkflowMutation';

const props = defineProps<{
  open: boolean;
  editing?: WorkflowDto | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const { mutate: create, isPending: isCreating } = useCreateWorkflowMutation();
const { mutate: update, isPending: isUpdating } = useUpdateWorkflowMutation();
const isPending = computed(() => isCreating.value || isUpdating.value);

const schema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    description: z.string().optional(),
  }),
);

const form = useForm({ validationSchema: schema });

watch(
  () => props.open,
  (isOpen) => {
    form.resetForm();
    if (!isOpen) return;
    if (props.editing) {
      form.setValues({ name: props.editing.name, description: props.editing.description ?? '' });
    }
  },
);

const onSubmit = form.handleSubmit((values) => {
  if (props.editing) {
    update(
      { id: props.editing.id, name: values.name, description: values.description },
      {
        onSuccess: () => {
          toast.success('Workflow actualizado');
          emit('update:open', false);
        },
        onError: () => toast.error('Error al actualizar'),
      },
    );
  } else {
    create(
      { id: uuidv7(), name: values.name, description: values.description },
      {
        onSuccess: () => {
          toast.success('Workflow creado');
          emit('update:open', false);
        },
        onError: () => toast.error('Error al crear'),
      },
    );
  }
});
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ editing ? 'Editar workflow' : 'Nuevo workflow' }}</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name" :validate-on-blur="false">
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl><Input placeholder="Workflow comercial" v-bind="componentField" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Descripción (opcional)</FormLabel>
            <FormControl><Input placeholder="Describe este workflow" v-bind="componentField" /></FormControl>
          </FormItem>
        </FormField>
        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">Cancelar</Button>
          <Button type="submit" :disabled="isPending">
            {{ isPending ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
