<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, XIcon } from 'lucide-vue-next';
import type { DefaultCustomFieldDto, CustomFieldType } from '@tfg/types';
import {
  useDefaultCustomFieldsQuery,
  useCreateDefaultCustomFieldMutation,
  useUpdateDefaultCustomFieldMutation,
  useDeleteDefaultCustomFieldMutation,
} from '~/modules/custom-field';
import { requiredString } from '~/modules/shared/lib/formValidation';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const { data, isLoading, isError, refetch } = useDefaultCustomFieldsQuery();
const items = computed(() => data.value?.pages.flatMap((p) => p.items) ?? []);
const total = computed(() => data.value?.pages[0]?.total ?? 0);

const { mutate: createItem, isPending: isCreating } = useCreateDefaultCustomFieldMutation();
const { mutate: updateItem, isPending: isUpdating } = useUpdateDefaultCustomFieldMutation();
const { mutate: deleteItem } = useDeleteDefaultCustomFieldMutation();

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'TEXT', label: 'Texto' },
  { value: 'NUMBER', label: 'Número' },
  { value: 'DATE', label: 'Fecha' },
  { value: 'BOOLEAN', label: 'Sí / No' },
  { value: 'CLASSIFIER', label: 'Clasificador' },
];

const TYPE_LABELS: Record<CustomFieldType, string> = {
  TEXT: 'Texto',
  NUMBER: 'Número',
  DATE: 'Fecha',
  BOOLEAN: 'Sí / No',
  CLASSIFIER: 'Clasificador',
};

const schema = toTypedSchema(
  z.object({
    name: requiredString('El nombre es obligatorio'),
    description: z.string().optional(),
    type: z.enum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'CLASSIFIER']).default('TEXT'),
    canSelectMultiple: z.boolean().default(false),
    automatic: z.boolean().default(false),
    aiPrompt: z.string().optional(),
  }),
);

const isDialogOpen = ref(false);
const editingItem = ref<DefaultCustomFieldDto | null>(null);
const classifiers = ref<string[]>([]);
const newClassifier = ref('');
const isPending = computed(() => isCreating.value || isUpdating.value);

const form = useForm({ validationSchema: schema });

// Derivado directamente del estado del form — sin ref manual
const currentType = computed(() => (form.values.type as CustomFieldType) ?? 'TEXT');
const isAutomatic = computed(() => form.values.automatic === true);

function openCreate() {
  editingItem.value = null;
  form.resetForm();
  classifiers.value = [];
  newClassifier.value = '';
  isDialogOpen.value = true;
}

function openEdit(item: DefaultCustomFieldDto) {
  editingItem.value = item;
  form.setValues({
    name: item.name,
    description: item.description ?? '',
    type: item.type,
    canSelectMultiple: item.canSelectMultiple,
    automatic: item.automatic,
    aiPrompt: item.aiPrompt ?? '',
  });
  classifiers.value = [...item.classifiers];
  newClassifier.value = '';
  isDialogOpen.value = true;
}

function addClassifier() {
  const val = newClassifier.value.trim();
  if (!val || classifiers.value.includes(val)) return;
  classifiers.value.push(val);
  newClassifier.value = '';
}

function removeClassifier(i: number) {
  classifiers.value.splice(i, 1);
}

const onSubmit = form.handleSubmit((values) => {
  const payload = {
    name: values.name,
    description: values.description || undefined,
    type: values.type,
    classifiers: values.type === 'CLASSIFIER' ? classifiers.value : [],
    canSelectMultiple: values.canSelectMultiple,
    automatic: values.automatic,
    aiPrompt: values.aiPrompt || undefined,
  };

  if (editingItem.value) {
    updateItem(
      { id: editingItem.value.id, ...payload },
      {
        onSuccess: () => {
          toast.success('Campo actualizado');
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
          toast.success('Campo creado');
          isDialogOpen.value = false;
          form.resetForm();
          classifiers.value = [];
        },
        onError: () => toast.error('Error al crear'),
      },
    );
  }
});

function handleDelete(id: string) {
  deleteItem(id, {
    onSuccess: () => toast.success('Campo eliminado'),
    onError: () => toast.error('Error al eliminar'),
  });
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold">Campos personalizados</h2>
        <p class="text-sm text-muted-foreground mt-1">
          {{ isLoading ? 'Cargando...' : `${total} campo${total === 1 ? '' : 's'}` }}
        </p>
      </div>
      <Button @click="openCreate">Nuevo campo</Button>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-14 rounded-lg bg-muted animate-pulse" />
    </div>

    <QueryErrorState
      v-else-if="isError"
      message="No se pudieron cargar los campos personalizados."
      @retry="refetch()"
    />

    <div v-else-if="!items.length" class="text-center py-16 text-muted-foreground text-sm">
      Sin campos personalizados. Crea el primero.
    </div>

    <div v-else class="space-y-2">
      <div v-for="item in items" :key="item.id" class="flex items-center gap-3 rounded-lg border bg-card p-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium truncate">{{ item.name }}</p>
            <Badge variant="outline" class="text-xs shrink-0">{{ TYPE_LABELS[item.type] }}</Badge>
            <Badge v-if="item.automatic" variant="outline" class="text-xs shrink-0 text-primary border-primary/30"
              >IA</Badge
            >
          </div>
          <p v-if="item.description" class="text-xs text-muted-foreground truncate mt-0.5">{{ item.description }}</p>
          <div v-if="item.classifiers.length" class="flex flex-wrap gap-1 mt-1">
            <span v-for="c in item.classifiers" :key="c" class="text-xs bg-muted rounded px-1.5 py-0.5">{{ c }}</span>
          </div>
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
          <DialogTitle>{{ editingItem ? 'Editar campo' : 'Nuevo campo personalizado' }}</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Presupuesto estimado" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Describe este campo" v-bind="componentField" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="type">
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem v-for="t in FIELD_TYPES" :key="t.value" :value="t.value">
                    {{ t.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>

          <template v-if="currentType === 'CLASSIFIER'">
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Opciones del clasificador</label>
              <div class="flex gap-2">
                <Input v-model="newClassifier" placeholder="Nueva opción" @keydown.enter.prevent="addClassifier" />
                <Button type="button" variant="outline" @click="addClassifier">Añadir</Button>
              </div>
              <div v-if="classifiers.length" class="flex flex-wrap gap-1">
                <span
                  v-for="(c, i) in classifiers"
                  :key="c"
                  class="flex items-center gap-1 text-xs bg-muted rounded px-2 py-1"
                >
                  {{ c }}
                  <button type="button" class="hover:text-destructive" @click="removeClassifier(i)">
                    <XIcon class="size-3" />
                  </button>
                </span>
              </div>
            </div>

            <FormField v-slot="{ value, handleChange }" name="canSelectMultiple">
              <FormItem class="flex items-center gap-2">
                <FormControl>
                  <Checkbox :checked="value" @update:checked="handleChange" />
                </FormControl>
                <FormLabel class="!mt-0 font-normal cursor-pointer">Permitir selección múltiple</FormLabel>
              </FormItem>
            </FormField>
          </template>

          <FormField v-slot="{ value, handleChange }" name="automatic">
            <FormItem class="flex items-center gap-2">
              <FormControl>
                <Checkbox :checked="value" @update:checked="handleChange" />
              </FormControl>
              <FormLabel class="!mt-0 font-normal cursor-pointer">Rellenar automáticamente con IA</FormLabel>
            </FormItem>
          </FormField>

          <FormField v-if="isAutomatic" v-slot="{ componentField }" name="aiPrompt">
            <FormItem>
              <FormLabel>Prompt de IA</FormLabel>
              <FormControl>
                <Input placeholder="Extrae el presupuesto total del pliego..." v-bind="componentField" />
              </FormControl>
            </FormItem>
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" @click="isDialogOpen = false">Cancelar</Button>
            <Button type="submit" :disabled="isPending">
              {{ isPending ? 'Guardando...' : editingItem ? 'Guardar cambios' : 'Crear' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
