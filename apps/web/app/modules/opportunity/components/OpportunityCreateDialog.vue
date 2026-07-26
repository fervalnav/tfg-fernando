<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import { useCreateOpportunityMutation } from '../composables/api/useCreateOpportunityMutation';

const props = defineProps<{
  pipelineId: string;
  pipelineStatusId: string;
}>();

const open = defineModel<boolean>('open', { default: false });

const schema = toTypedSchema(
  z.object({
    title: z.string().min(1, 'El título es obligatorio'),
    description: z.string().optional(),
    amount: z.number({ invalid_type_error: 'Debe ser un número' }).min(0).optional(),
    currency: z.string().default('EUR'),
    dueDate: z.string().optional(),
  }),
);

const form = useForm({ validationSchema: schema });
const { mutate: createOpportunity, isPending } = useCreateOpportunityMutation();

const onSubmit = form.handleSubmit((values) => {
  createOpportunity(
    {
      id: uuidv7(),
      pipelineId: props.pipelineId,
      pipelineStatusId: props.pipelineStatusId,
      title: values.title,
      description: values.description,
      amount: values.amount,
      currency: values.currency,
      dueDate: values.dueDate,
    },
    {
      onSuccess: () => {
        toast.success('Oportunidad creada');
        open.value = false;
        form.resetForm();
      },
      onError: () => toast.error('Error al crear la oportunidad'),
    },
  );
});

function handleClose() {
  open.value = false;
  form.resetForm();
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Nueva oportunidad</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel>Título <span class="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input placeholder="Nombre de la oportunidad" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Input placeholder="Descripción opcional" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-3 gap-3">
          <FormField v-slot="{ componentField }" name="amount" class="col-span-2">
            <FormItem class="col-span-2">
              <FormLabel>Importe</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  v-bind="componentField"
                  @change="
                    (e: Event) => {
                      const v = (e.target as HTMLInputElement).valueAsNumber;
                      form.setFieldValue('amount', isNaN(v) ? undefined : v);
                    }
                  "
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="currency">
            <FormItem>
              <FormLabel>Moneda</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="dueDate">
          <FormItem>
            <FormLabel>Fecha límite</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleClose">Cancelar</Button>
          <Button type="submit" :disabled="isPending">
            {{ isPending ? 'Creando...' : 'Crear oportunidad' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
