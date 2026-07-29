<script setup lang="ts">
import { CheckIcon, PlusIcon } from 'lucide-vue-next';

type TemplateOption = {
  id: string;
  title: string;
  description?: string | null;
};

defineProps<{
  title: string;
  description: string;
  emptyLabel: string;
  templates: TemplateOption[];
  installedTemplateIds: string[];
  pendingTemplateId?: string;
}>();

const emit = defineEmits<{
  add: [templateId: string];
}>();
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button>
        <PlusIcon class="mr-2 size-4" />
        Añadir
      </Button>
    </DialogTrigger>
    <DialogContent class="max-h-[80vh] overflow-hidden sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>

      <div
        v-if="!templates.length"
        class="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground"
      >
        {{ emptyLabel }}
      </div>
      <div v-else class="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
        <div
          v-for="template in templates"
          :key="template.id"
          class="flex items-start gap-4 rounded-lg border p-4"
          :class="installedTemplateIds.includes(template.id) ? 'bg-muted/40' : 'bg-background'"
        >
          <div class="min-w-0 flex-1">
            <p class="font-medium">{{ template.title }}</p>
            <p v-if="template.description" class="mt-1 text-sm text-muted-foreground">{{ template.description }}</p>
          </div>
          <Button
            size="sm"
            :variant="installedTemplateIds.includes(template.id) ? 'secondary' : 'outline'"
            :disabled="installedTemplateIds.includes(template.id) || Boolean(pendingTemplateId)"
            @click="emit('add', template.id)"
          >
            <CheckIcon v-if="installedTemplateIds.includes(template.id)" class="mr-2 size-4" />
            {{ installedTemplateIds.includes(template.id) ? 'Añadida' : 'Añadir' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
