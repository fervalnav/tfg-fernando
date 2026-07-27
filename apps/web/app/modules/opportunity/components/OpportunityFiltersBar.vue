<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { SearchIcon, SlidersHorizontalIcon, UserIcon, XIcon } from 'lucide-vue-next';
import type { AccountMemberDto, PipelineStatusDto } from '@tfg/types';
import { useOpportunityFilters } from '../composables/useOpportunityFilters';

const props = defineProps<{
  statuses?: PipelineStatusDto[];
  members?: AccountMemberDto[];
}>();

const {
  q,
  statusIds,
  userId,
  dueDateFrom,
  dueDateTo,
  amountMin,
  amountMax,
  hasActiveFilters,
  setFilter,
  resetFilters,
} = useOpportunityFilters();

const searchValue = ref(q.value ?? '');

watch(q, (value) => {
  if ((value ?? '') !== searchValue.value) searchValue.value = value ?? '';
});

const applySearch = useDebounceFn((value: string) => {
  setFilter('q', value.trim() || undefined);
}, 300);

const selectedMember = computed(() => props.members?.find((member) => member.userId === userId.value));

const statusFilterLabel = computed(() => {
  if (!statusIds.value.length) return 'Estados';
  if (statusIds.value.length === 1) {
    return props.statuses?.find((status) => status.id === statusIds.value[0])?.name ?? '1 estado';
  }
  return `${statusIds.value.length} estados`;
});

function handleSearch(value: string | number): void {
  searchValue.value = String(value);
  applySearch(searchValue.value);
}

function toggleStatus(id: string, isChecked: boolean): void {
  const next = isChecked ? [...statusIds.value, id] : statusIds.value.filter((statusId) => statusId !== id);
  setFilter('statusIds', [...new Set(next)].length ? [...new Set(next)] : undefined);
}

function setResponsible(value: unknown): void {
  setFilter('userId', typeof value === 'string' && value !== 'all' ? value : undefined);
}
</script>

<template>
  <div class="shrink-0 border-b bg-background px-4 py-2.5">
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative min-w-52 flex-1 basis-60 max-w-80">
        <SearchIcon class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          :model-value="searchValue"
          class="h-9 pl-8"
          placeholder="Buscar oportunidades..."
          aria-label="Buscar oportunidades"
          @update:model-value="handleSearch"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="h-9 max-w-48 gap-2">
            <SlidersHorizontalIcon class="size-4 shrink-0" />
            <span class="truncate">{{ statusFilterLabel }}</span>
            <Badge v-if="statusIds.length" variant="secondary" class="ml-1 h-5 min-w-5 px-1.5">
              {{ statusIds.length }}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-60">
          <DropdownMenuLabel>Estados del pipeline</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            v-for="status in statuses"
            :key="status.id"
            :model-value="statusIds.includes(status.id)"
            @update:model-value="(isChecked: boolean) => toggleStatus(status.id, isChecked)"
          >
            <span class="mr-2 size-2 rounded-full" :style="{ backgroundColor: status.backgroundColor ?? '#94a3b8' }" />
            <span class="truncate">{{ status.name }}</span>
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Select :model-value="userId ?? 'all'" @update:model-value="setResponsible">
        <SelectTrigger class="h-9 w-48">
          <UserIcon class="mr-2 size-4 shrink-0 text-muted-foreground" />
          <SelectValue>
            <span class="truncate">
              {{ selectedMember ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}` : 'Responsable' }}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los responsables</SelectItem>
          <SelectItem v-for="member in members" :key="member.userId" :value="member.userId">
            {{ member.user.firstName }} {{ member.user.lastName }}
          </SelectItem>
        </SelectContent>
      </Select>

      <div class="flex items-center gap-1 rounded-md border bg-background px-2">
        <span class="text-xs text-muted-foreground">Vence</span>
        <Input
          type="date"
          :model-value="dueDateFrom ?? ''"
          class="h-8 w-32 border-0 px-1 shadow-none focus-visible:ring-0"
          aria-label="Fecha límite desde"
          @update:model-value="(value: string) => setFilter('dueDateFrom', value || undefined)"
        />
        <span class="text-xs text-muted-foreground">—</span>
        <Input
          type="date"
          :model-value="dueDateTo ?? ''"
          class="h-8 w-32 border-0 px-1 shadow-none focus-visible:ring-0"
          aria-label="Fecha límite hasta"
          @update:model-value="(value: string) => setFilter('dueDateTo', value || undefined)"
        />
      </div>

      <div class="flex items-center gap-1 rounded-md border bg-background px-2">
        <span class="text-xs text-muted-foreground">Importe</span>
        <Input
          type="number"
          min="0"
          placeholder="Mín."
          :model-value="amountMin ?? ''"
          class="h-8 w-20 border-0 px-1 shadow-none focus-visible:ring-0"
          aria-label="Importe mínimo"
          @update:model-value="
            (value: string | number) => setFilter('amountMin', value !== '' ? Number(value) : undefined)
          "
        />
        <span class="text-xs text-muted-foreground">—</span>
        <Input
          type="number"
          min="0"
          placeholder="Máx."
          :model-value="amountMax ?? ''"
          class="h-8 w-20 border-0 px-1 shadow-none focus-visible:ring-0"
          aria-label="Importe máximo"
          @update:model-value="
            (value: string | number) => setFilter('amountMax', value !== '' ? Number(value) : undefined)
          "
        />
      </div>

      <Button
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        class="h-9 gap-1.5 text-muted-foreground"
        @click="resetFilters"
      >
        <XIcon class="size-4" />
        Limpiar
      </Button>
    </div>
  </div>
</template>
