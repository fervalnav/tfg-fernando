<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import type { PipelineStatusDto } from '@tfg/types';
import { useCreatePipelineStatusMutation } from '../composables/api/useCreatePipelineStatusMutation';
import { useUpdatePipelineStatusMutation } from '../composables/api/useUpdatePipelineStatusMutation';
import { requiredString } from '~/modules/shared/lib/formValidation';

const props = defineProps<{
  pipelineId: string;
  status?: PipelineStatusDto;
}>();
const emit = defineEmits<{ saved: [] }>();

const isOpen = defineModel<boolean>('open', { default: false });
const isEditing = computed(() => !!props.status);

const OUTCOME_OPTIONS = [
  { value: 'NONE', label: 'Ninguno' },
  { value: 'WON', label: 'Ganada' },
  { value: 'LOST', label: 'Perdida' },
  { value: 'DROPPED', label: 'Descartada' },
] as const;

const schema = toTypedSchema(
  z.object({
    name: requiredString('El nombre es obligatorio'),
    description: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    isTerminal: z.boolean().default(false),
    outcomeType: z.enum(['NONE', 'WON', 'LOST', 'DROPPED']).default('NONE'),
    showInKanban: z.boolean().default(true),
  }),
);

const form = useForm({ validationSchema: schema });
const { mutate: createStatus, isPending: isCreating } = useCreatePipelineStatusMutation();
const { mutate: updateStatus, isPending: isUpdating } = useUpdatePipelineStatusMutation();
const isPending = computed(() => isCreating.value || isUpdating.value);

watch(isOpen, (open) => {
  if (!open) {
    form.resetForm();
    return;
  }
  if (props.status) {
    form.setValues({
      name: props.status.name,
      description: props.status.description ?? '',
      backgroundColor: props.status.backgroundColor ?? '#e2e8f0',
      textColor: props.status.textColor ?? '#1e293b',
      isTerminal: props.status.isTerminal,
      outcomeType: props.status.outcomeType,
      showInKanban: props.status.showInKanban,
    });
  } else {
    form.resetForm();
  }
});

const onSubmit = form.handleSubmit((values) => {
  const payload = {
    name: values.name,
    description: values.description ?? undefined,
    backgroundColor: values.backgroundColor ?? undefined,
    textColor: values.textColor ?? undefined,
    isTerminal: values.isTerminal,
    outcomeType: values.outcomeType,
    showInKanban: values.showInKanban,
  };

  if (isEditing.value && props.status) {
    updateStatus(
      { pipelineId: props.pipelineId, statusId: props.status.id, ...payload },
      {
        onSuccess: () => {
          toast.success('Estado actualizado');
          isOpen.value = false;
          emit('saved');
        },
        onError: () => toast.error('Error al actualizar el estado'),
      },
    );
  } else {
    createStatus(
      { pipelineId: props.pipelineId, id: uuidv7(), ...payload },
      {
        onSuccess: () => {
          toast.success('Estado creado');
          isOpen.value = false;
          form.resetForm();
          emit('saved');
        },
        onError: () => toast.error('Error al crear el estado'),
      },
    );
  }
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <slot>
      <DialogTrigger as-child>
        <Button size="sm">Añadir estado</Button>
      </DialogTrigger>
    </slot>
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? 'Editar estado' : 'Nuevo estado' }}</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl><Input placeholder="En preparación" v-bind="componentField" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Descripción (opcional)</FormLabel>
            <FormControl><Input placeholder="Describe este estado" v-bind="componentField" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ value, handleChange }" name="backgroundColor">
            <FormItem>
              <FormLabel>Color de fondo</FormLabel>
              <FormControl>
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    :value="value"
                    class="h-9 w-9 cursor-pointer rounded border border-input p-0.5"
                    @input="handleChange(($event.target as HTMLInputElement).value)"
                  >
                  <span class="text-sm text-muted-foreground">{{ value }}</span>
                </div>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ value, handleChange }" name="textColor">
            <FormItem>
              <FormLabel>Color de texto</FormLabel>
              <FormControl>
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    :value="value"
                    class="h-9 w-9 cursor-pointer rounded border border-input p-0.5"
                    @input="handleChange(($event.target as HTMLInputElement).value)"
                  >
                  <span class="text-sm text-muted-foreground">{{ value }}</span>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ value, handleChange }" name="isTerminal">
          <FormItem class="flex items-center gap-3">
            <FormControl>
              <Checkbox :checked="value" @update:checked="handleChange" />
            </FormControl>
            <FormLabel class="!mt-0 font-normal cursor-pointer">Estado terminal (cierre)</FormLabel>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="outcomeType">
          <FormItem>
            <FormLabel>Resultado</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona resultado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="opt in OUTCOME_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="showInKanban">
          <FormItem class="flex items-center gap-3">
            <FormControl>
              <Checkbox :checked="value" @update:checked="handleChange" />
            </FormControl>
            <FormLabel class="!mt-0 font-normal cursor-pointer">Visible en Kanban</FormLabel>
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button type="button" variant="outline" @click="isOpen = false">Cancelar</Button>
          <Button type="submit" :disabled="isPending">
            {{ isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear estado' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
