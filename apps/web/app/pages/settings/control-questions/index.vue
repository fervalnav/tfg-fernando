<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-vue-next';
import type { DefaultControlQuestionDto } from '@tfg/types';
import {
  useDefaultControlQuestionsQuery,
  useCreateDefaultControlQuestionMutation,
  useUpdateDefaultControlQuestionMutation,
  useDeleteDefaultControlQuestionMutation,
} from '~/modules/control-question';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const { data, isLoading } = useDefaultControlQuestionsQuery();
const items = computed(() => data.value?.pages.flatMap((p) => p.items) ?? []);
const total = computed(() => data.value?.pages[0]?.total ?? 0);

const { mutate: createItem, isPending: isCreating } = useCreateDefaultControlQuestionMutation();
const { mutate: updateItem, isPending: isUpdating } = useUpdateDefaultControlQuestionMutation();
const { mutate: deleteItem } = useDeleteDefaultControlQuestionMutation();

const ANSWER_TYPES = [
  { value: 'TEXT', label: 'Texto libre' },
  { value: 'BOOLEAN', label: 'Sí / No' },
] as const;

const schema = toTypedSchema(
  z.object({
    question: z.string().min(1, 'La pregunta es obligatoria'),
    answerType: z.enum(['TEXT', 'BOOLEAN']).default('TEXT'),
    passConditionPrompt: z.string().optional(),
  }),
);

const isDialogOpen = ref(false);
const editingItem = ref<DefaultControlQuestionDto | null>(null);
const isPending = computed(() => isCreating.value || isUpdating.value);

const form = useForm({ validationSchema: schema });

function openCreate() {
  editingItem.value = null;
  form.resetForm();
  isDialogOpen.value = true;
}

function openEdit(item: DefaultControlQuestionDto) {
  editingItem.value = item;
  form.setValues({
    question: item.question,
    answerType: item.answerType,
    passConditionPrompt: item.passConditionPrompt ?? '',
  });
  isDialogOpen.value = true;
}

const onSubmit = form.handleSubmit((values) => {
  const payload = {
    question: values.question,
    answerType: values.answerType,
    passConditionPrompt: values.passConditionPrompt || undefined,
  };

  if (editingItem.value) {
    updateItem(
      { id: editingItem.value.id, ...payload },
      {
        onSuccess: () => {
          toast.success('Pregunta actualizada');
          isDialogOpen.value = false;
        },
        onError: () => toast.error('Error al actualizar'),
      },
    );
  } else {
    createItem(
      { id: uuidv7(), ...payload },
      {
        onSuccess: () => {
          toast.success('Pregunta creada');
          isDialogOpen.value = false;
          form.resetForm();
        },
        onError: () => toast.error('Error al crear'),
      },
    );
  }
});

function handleDelete(id: string) {
  deleteItem(id, {
    onSuccess: () => toast.success('Pregunta eliminada'),
    onError: () => toast.error('Error al eliminar'),
  });
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Preguntas de control</h2>
        <p class="text-sm text-muted-foreground mt-1">
          {{ isLoading ? 'Cargando...' : `${total} pregunta${total === 1 ? '' : 's'}` }}
        </p>
      </div>
      <Button @click="openCreate">Nueva pregunta</Button>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-14 rounded-lg bg-muted animate-pulse" />
    </div>

    <div v-else-if="!items.length" class="text-center py-16 text-muted-foreground text-sm">
      Sin preguntas de control. Crea la primera.
    </div>

    <div v-else class="space-y-2">
      <div v-for="item in items" :key="item.id" class="flex items-center gap-3 rounded-lg border bg-card p-4">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ item.question }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ item.answerType === 'TEXT' ? 'Texto libre' : 'Sí / No' }}
            <span v-if="item.passConditionPrompt" class="ml-2">· Con condición de éxito</span>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button size="icon" variant="ghost" class="size-8 shrink-0">
              <MoreHorizontalIcon class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="openEdit(item)"> <PencilIcon class="mr-2 size-4" /> Editar </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive focus:text-destructive" @click="handleDelete(item.id)">
              <Trash2Icon class="mr-2 size-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editingItem ? 'Editar pregunta' : 'Nueva pregunta de control' }}</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="question">
            <FormItem>
              <FormLabel>Pregunta</FormLabel>
              <FormControl
                ><Input placeholder="¿Se ha revisado el pliego de condiciones?" v-bind="componentField"
              /></FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="answerType">
            <FormItem>
              <FormLabel>Tipo de respuesta</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem v-for="t in ANSWER_TYPES" :key="t.value" :value="t.value">{{ t.label }}</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="passConditionPrompt">
            <FormItem>
              <FormLabel>Condición de éxito (opcional, para evaluación por IA)</FormLabel>
              <FormControl
                ><Input placeholder="La respuesta debe confirmar que se ha leído el pliego" v-bind="componentField"
              /></FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" @click="isDialogOpen = false">Cancelar</Button>
            <Button type="submit" :disabled="isPending">{{
              isPending ? 'Guardando...' : editingItem ? 'Guardar cambios' : 'Crear'
            }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
