<script setup lang="ts">
import { BotIcon, CheckCircle2Icon, ListChecksIcon, SaveIcon, SparklesIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { v7 as uuidv7 } from 'uuid';
import type { CustomFieldDto, CustomFieldValue } from '@tfg/types';
import {
  useCustomFieldTemplatesQuery,
  useOpportunityCustomFieldsQuery,
} from '../composables/api/useOpportunityQualificationQueries';
import {
  useAddCustomFieldToOpportunityMutation,
  useSetCustomFieldValueMutation,
} from '../composables/api/useOpportunityQualificationMutations';
import OpportunityAddTemplatesDialog from './OpportunityAddTemplatesDialog.vue';

const props = defineProps<{ opportunityId: string }>();
const { data: fields, isLoading } = useOpportunityCustomFieldsQuery(() => props.opportunityId);
const { data: templates } = useCustomFieldTemplatesQuery();
const { mutate: setValue, isPending } = useSetCustomFieldValueMutation();
const { mutate: addField } = useAddCustomFieldToOpportunityMutation();
const draftValues = ref<Record<string, Exclude<CustomFieldValue, null>>>({});
const pendingTemplateId = ref<string>();
const installedTemplateIds = computed(() => fields.value?.map((item) => item.defaultCustomFieldId) ?? []);
const templateOptions = computed(
  () =>
    templates.value?.map((template) => ({
      id: template.id,
      title: template.name,
      description: template.description,
    })) ?? [],
);

watch(
  fields,
  (items) => {
    for (const item of items ?? []) {
      if (item.value !== null) draftValues.value[item.id] = item.value;
    }
  },
  { immediate: true },
);

function inputValue(id: string): string | number {
  const value = draftValues.value[id];
  return typeof value === 'string' || typeof value === 'number' ? value : '';
}

function stringValue(id: string): string {
  const value = draftValues.value[id];
  return typeof value === 'string' ? value : '';
}

function booleanValue(id: string): string | undefined {
  const value = draftValues.value[id];
  return typeof value === 'boolean' ? String(value) : undefined;
}

function updateInput(field: CustomFieldDto, value: string | number): void {
  draftValues.value[field.id] = field.type === 'NUMBER' ? Number(value) : String(value);
}

function selectedClassifiers(id: string): string[] {
  const value = draftValues.value[id];
  return Array.isArray(value) ? value : [];
}

function toggleClassifier(id: string, classifier: string, checked: boolean): void {
  const selected = new Set(selectedClassifiers(id));
  if (checked) selected.add(classifier);
  else selected.delete(classifier);
  draftValues.value[id] = [...selected];
}

function save(field: CustomFieldDto): void {
  const value = draftValues.value[field.id];
  if (value === undefined || value === '' || (Array.isArray(value) && !value.length)) {
    toast.error('Introduce un valor');
    return;
  }
  setValue(
    { opportunityId: props.opportunityId, customFieldId: field.id, value },
    {
      onSuccess: () => toast.success('Campo actualizado'),
      onError: () => toast.error('No se pudo actualizar el campo'),
    },
  );
}

function add(templateId: string): void {
  pendingTemplateId.value = templateId;
  addField(
    {
      id: uuidv7(),
      opportunityId: props.opportunityId,
      defaultCustomFieldId: templateId,
    },
    {
      onSuccess: () => toast.success('Campo añadido'),
      onError: () => toast.error('No se pudo añadir el campo'),
      onSettled: () => (pendingTemplateId.value = undefined),
    },
  );
}
</script>

<template>
  <section>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-violet-600">
          <BotIcon class="size-4" />
          <span class="text-sm font-medium">Cualificación inteligente</span>
        </div>
        <h2 class="mt-2 text-2xl font-semibold">Campos personalizados</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Información estructurada extraída o revisada durante la cualificación de la oportunidad.
        </p>
      </div>
      <OpportunityAddTemplatesDialog
        title="Añadir campos personalizados"
        description="Selecciona las plantillas que quieres incorporar a esta oportunidad."
        empty-label="No hay plantillas de campos disponibles."
        :templates="templateOptions"
        :installed-template-ids="installedTemplateIds"
        :pending-template-id="pendingTemplateId"
        @add="add"
      />
    </div>

    <div v-if="isLoading" class="py-12 text-center text-sm text-muted-foreground">Cargando campos...</div>
    <Card v-else-if="!fields?.length">
      <CardContent class="flex flex-col items-center py-12 text-center">
        <ListChecksIcon class="size-9 text-muted-foreground/50" />
        <p class="mt-3 font-medium">No hay campos personalizados</p>
        <p class="mt-1 text-sm text-muted-foreground">Esta oportunidad no tiene campos configurados.</p>
      </CardContent>
    </Card>

    <div v-else class="grid gap-4 xl:grid-cols-2">
      <Card v-for="field in fields" :key="field.id">
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <CardTitle class="text-base">{{ field.name }}</CardTitle>
              <CardDescription v-if="field.description" class="mt-1">{{ field.description }}</CardDescription>
            </div>
            <Badge v-if="field.automatic" variant="secondary" class="gap-1 text-violet-700">
              <SparklesIcon class="size-3.5" />
              IA
            </Badge>
            <Badge v-else-if="field.value !== null" variant="secondary" class="gap-1 text-emerald-700">
              <CheckCircle2Icon class="size-3.5" />
              Informado
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <Input
            v-if="field.type === 'TEXT' || field.type === 'DATE' || field.type === 'NUMBER'"
            :type="field.type === 'DATE' ? 'date' : field.type === 'NUMBER' ? 'number' : 'text'"
            :model-value="inputValue(field.id)"
            @update:model-value="updateInput(field, $event)"
          />

          <Select
            v-else-if="field.type === 'BOOLEAN'"
            :model-value="booleanValue(field.id)"
            @update:model-value="draftValues[field.id] = $event === 'true'"
          >
            <SelectTrigger><SelectValue placeholder="Selecciona un valor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>

          <Select
            v-else-if="!field.canSelectMultiple"
            :model-value="stringValue(field.id)"
            @update:model-value="draftValues[field.id] = $event"
          >
            <SelectTrigger><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="classifier in field.classifiers" :key="classifier" :value="classifier">
                {{ classifier }}
              </SelectItem>
            </SelectContent>
          </Select>

          <div v-else class="space-y-2 rounded-md border p-3">
            <label v-for="classifier in field.classifiers" :key="classifier" class="flex items-center gap-2 text-sm">
              <Checkbox
                :model-value="selectedClassifiers(field.id).includes(classifier)"
                @update:model-value="toggleClassifier(field.id, classifier, Boolean($event))"
              />
              {{ classifier }}
            </label>
          </div>

          <div class="flex justify-end">
            <Button size="sm" :disabled="isPending" @click="save(field)">
              <SaveIcon class="mr-2 size-4" />
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
