<script setup lang="ts">
import { FilterIcon, XIcon } from 'lucide-vue-next';
import type { PipelineStatusDto } from '@tfg/types';
import { useOpportunityFilters } from '../composables/useOpportunityFilters';

defineProps<{ statuses?: PipelineStatusDto[] }>();

const { q, statusIds, dueDateFrom, dueDateTo, amountMin, amountMax, hasActiveFilters, setFilter, resetFilters } =
  useOpportunityFilters();

const isOpen = ref(false);

const activeCount = computed(() => {
  let count = 0;
  if (q.value) count++;
  if (statusIds.value.length) count++;
  if (dueDateFrom.value || dueDateTo.value) count++;
  if (amountMin.value !== undefined || amountMax.value !== undefined) count++;
  return count;
});

function toggleStatus(id: string) {
  const current = [...statusIds.value];
  const idx = current.indexOf(id);
  if (idx === -1) {
    current.push(id);
  } else {
    current.splice(idx, 1);
  }
  setFilter('statusIds', current.length ? current : undefined);
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 gap-1.5 relative">
        <FilterIcon class="size-3.5" />
        Filtros
        <span
          v-if="activeCount > 0"
          class="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center leading-none"
        >
          {{ activeCount }}
        </span>
      </Button>
    </SheetTrigger>
    <SheetContent side="right" class="w-80">
      <SheetHeader>
        <SheetTitle class="flex items-center justify-between">
          Filtros
          <Button v-if="hasActiveFilters" variant="ghost" size="sm" class="h-7 text-xs" @click="resetFilters">
            <XIcon class="size-3.5 mr-1" />
            Limpiar todo
          </Button>
        </SheetTitle>
      </SheetHeader>

      <div class="mt-6 space-y-6">
        <!-- Búsqueda por texto -->
        <div class="space-y-2">
          <Label>Buscar por título</Label>
          <Input
            :model-value="q ?? ''"
            placeholder="Buscar..."
            @update:model-value="(v: string) => setFilter('q', v || undefined)"
          />
        </div>

        <!-- Filtro por estado -->
        <div v-if="statuses?.length" class="space-y-2">
          <Label>Estado</Label>
          <div class="space-y-1.5">
            <label v-for="status in statuses" :key="status.id" class="flex items-center gap-2.5 cursor-pointer">
              <Checkbox :checked="statusIds.includes(status.id)" @update:checked="() => toggleStatus(status.id)" />
              <span class="flex items-center gap-1.5 text-sm">
                <span class="size-2 rounded-full" :style="{ backgroundColor: status.backgroundColor ?? '#94a3b8' }" />
                {{ status.name }}
              </span>
            </label>
          </div>
        </div>

        <!-- Rango de fecha límite -->
        <div class="space-y-2">
          <Label>Fecha límite</Label>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Desde</span>
              <Input
                type="date"
                :model-value="dueDateFrom ?? ''"
                @update:model-value="(v: string) => setFilter('dueDateFrom', v || undefined)"
              />
            </div>
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Hasta</span>
              <Input
                type="date"
                :model-value="dueDateTo ?? ''"
                @update:model-value="(v: string) => setFilter('dueDateTo', v || undefined)"
              />
            </div>
          </div>
        </div>

        <!-- Rango de importe -->
        <div class="space-y-2">
          <Label>Importe (€)</Label>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Mínimo</span>
              <Input
                type="number"
                min="0"
                placeholder="0"
                :model-value="amountMin ?? ''"
                @update:model-value="(v: string | number) => setFilter('amountMin', v !== '' ? Number(v) : undefined)"
              />
            </div>
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Máximo</span>
              <Input
                type="number"
                min="0"
                placeholder="∞"
                :model-value="amountMax ?? ''"
                @update:model-value="(v: string | number) => setFilter('amountMax', v !== '' ? Number(v) : undefined)"
              />
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
