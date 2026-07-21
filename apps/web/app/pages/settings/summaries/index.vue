<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-vue-next';
import type { SummaryTemplateDto } from '@tfg/types';
import {
  useSummaryTemplatesQuery,
  useCreateSummaryTemplateMutation,
  useUpdateSummaryTemplateMutation,
  useDeleteSummaryTemplateMutation,
} from '~/modules/summary';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const { data, isLoading } = useSummaryTemplatesQuery();
const items = computed(() => data.value?.pages.flatMap((p) => p.items) ?? []);
const total = computed(() => data.value?.pages[0]?.total ?? 0);

const { mutate: createItem, isPending: isCreating } = useCreateSummaryTemplateMutation();
const { mutate: updateItem, isPending: isUpdating } = useUpdateSummaryTemplateMutation();
const { mutate: deleteItem } = useDeleteSummaryTemplateMutation();

const schema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    prompt: z.string().min(1, 'El prompt es obligatorio'),
  }),
);

const isDialogOpen = ref(false);
const editingItem = ref<SummaryTemplateDto | null>(null);
const isPending = computed(() => isCreating.value || isUpdating.value);

const form = useForm({ validationSchema: schema });

function openCreate() {
  editingItem.value = null;
  form.resetForm();
  isDialogOpen.value = true;
}
function openEdit(item: SummaryTemplateDto) {
  editingItem.value = item;
  form.setValues({ name: item.name, prompt: item.prompt });
  isDialogOpen.value = true;
}

const onSubmit = form.handleSubmit((values) => {
  if (editingItem.value) {
    updateItem(
      { id: editingItem.value.id, ...values },
      {
        onSuccess: () => {
          toast.success('Plantilla actualizada');
          isDialogOpen.value = false;
        },
        onError: () => toast.error('Error al actualizar'),
      },
    );
  } else {
    createItem(
      { id: uuidv7(), ...values },
      {
        onSuccess: () => {
          toast.success('Plantilla creada');
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
    onSuccess: () => toast.success('Plantilla eliminada'),
    onError: () => toast.error('Error al eliminar'),
  });
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Plantillas de resumen</h2>
        <p class="text-sm text-muted-foreground mt-1">
          {{ isLoading ? 'Cargando...' : `${total} plantilla${total === 1 ? '' : 's'}` }}
        </p>
      </div>
      <Button @click="openCreate">Nueva plantilla</Button>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-14 rounded-lg bg-muted animate-pulse" />
    </div>

    <div v-else-if="!items.length" class="text-center py-16 text-muted-foreground text-sm">
      Sin plantillas de resumen. Crea la primera para usarla en workflows.
    </div>

    <div v-else class="space-y-2">
      <div v-for="item in items" :key="item.id" class="flex items-center gap-3 rounded-lg border bg-card p-4">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ item.name }}</p>
          <p class="text-xs text-muted-foreground truncate mt-0.5">{{ item.prompt }}</p>
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
          <DialogTitle>{{ editingItem ? 'Editar plantilla' : 'Nueva plantilla de resumen' }}</DialogTitle>
          <DialogDescription>El prompt se usará como instrucción para la IA al generar el resumen.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl
                ><Input placeholder="Resumen ejecutivo de la licitación" v-bind="componentField"
              /></FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="prompt">
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <textarea
                  class="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                  placeholder="Genera un resumen ejecutivo de esta licitación pública, destacando el objeto del contrato, el presupuesto base y los criterios de adjudicación..."
                  v-bind="componentField"
                />
              </FormControl>
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
