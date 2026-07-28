<script setup lang="ts">
import { MoreHorizontalIcon, Trash2Icon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import type { OpportunityDto, PipelineDto } from '@tfg/types';
import { useDeleteOpportunityMutation } from '../composables/api/useDeleteOpportunityMutation';

const props = defineProps<{
  opportunities: OpportunityDto[];
  isLoading: boolean;
  pipeline?: PipelineDto;
}>();

const { mutate: deleteOpportunity } = useDeleteOpportunityMutation();

const statusMap = computed(() => Object.fromEntries((props.pipeline?.statuses ?? []).map((s) => [s.id, s])));

function getStatusName(statusId: string): string {
  return statusMap.value[statusId]?.name ?? '-';
}

function getStatusColor(statusId: string): string {
  return statusMap.value[statusId]?.backgroundColor ?? '#94a3b8';
}

function formatAmount(amount: number | null, currency: string | null): string {
  if (amount == null) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

function handleDelete(id: string, title: string) {
  if (!confirm(`¿Eliminar "${title}"?`)) return;
  deleteOpportunity(id, {
    onSuccess: () => toast.success('Oportunidad eliminada'),
    onError: () => toast.error('Error al eliminar'),
  });
}
</script>

<template>
  <div class="rounded-md border">
    <!-- Loading -->
    <div v-if="isLoading" class="p-8 text-center text-sm text-muted-foreground">Cargando...</div>

    <!-- Empty -->
    <div v-else-if="!opportunities.length" class="p-8 text-center text-sm text-muted-foreground">
      No hay oportunidades con los filtros actuales.
    </div>

    <!-- Table -->
    <table v-else class="w-full text-sm">
      <thead>
        <tr class="border-b bg-muted/40">
          <th class="px-4 py-3 text-left font-medium">Título</th>
          <th class="px-4 py-3 text-left font-medium">Estado</th>
          <th class="px-4 py-3 text-left font-medium">Importe</th>
          <th class="px-4 py-3 text-left font-medium">Vencimiento</th>
          <th class="px-4 py-3 text-left font-medium">Creada</th>
          <th class="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="opp in opportunities"
          :key="opp.id"
          class="border-b last:border-0 hover:bg-muted/30 transition-colors"
        >
          <td class="px-4 py-3 font-medium max-w-xs truncate">
            <NuxtLink :to="`/opportunities/${opp.id}`" class="hover:underline">{{ opp.title }}</NuxtLink>
          </td>
          <td class="px-4 py-3">
            <Badge variant="outline" class="gap-1.5" :style="{ borderColor: getStatusColor(opp.pipelineStatusId) }">
              <span class="size-1.5 rounded-full" :style="{ backgroundColor: getStatusColor(opp.pipelineStatusId) }" />
              {{ getStatusName(opp.pipelineStatusId) }}
            </Badge>
          </td>
          <td class="px-4 py-3 text-muted-foreground tabular-nums">
            {{ formatAmount(opp.amount, opp.currency) }}
          </td>
          <td
            class="px-4 py-3 text-muted-foreground"
            :class="{ 'text-destructive': opp.dueDate && new Date(opp.dueDate) < new Date() }"
          >
            {{ formatDate(opp.dueDate) }}
          </td>
          <td class="px-4 py-3 text-muted-foreground">{{ formatDate(opp.createdAt) }}</td>
          <td class="px-4 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="size-8">
                  <MoreHorizontalIcon class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="handleDelete(opp.id, opp.title)"
                >
                  <Trash2Icon class="mr-2 size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
