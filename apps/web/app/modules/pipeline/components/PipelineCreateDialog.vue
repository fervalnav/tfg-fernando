<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import { useCreatePipelineMutation } from '../composables/api/useCreatePipelineMutation';

const emit = defineEmits<{ created: [] }>();

const isOpen = ref(false);

const schema = toTypedSchema(z.object({ name: z.string().min(1, 'El nombre es obligatorio') }));
const form = useForm({ validationSchema: schema });
const { mutate: createPipeline, isPending } = useCreatePipelineMutation();

const onSubmit = form.handleSubmit((values) => {
  createPipeline(
    { id: uuidv7(), name: values.name },
    {
      onSuccess: () => {
        toast.success('Pipeline creado');
        isOpen.value = false;
        form.resetForm();
        emit('created');
      },
      onError: () => toast.error('Error al crear el pipeline'),
    },
  );
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button>Nuevo pipeline</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Nuevo pipeline</DialogTitle>
        <DialogDescription>Crea un pipeline con estados predefinidos para licitaciones.</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Pipeline de licitaciones" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isOpen = false">Cancelar</Button>
          <Button type="submit" :disabled="isPending">
            {{ isPending ? 'Creando...' : 'Crear pipeline' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
