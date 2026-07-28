<script setup lang="ts">
import { CalendarIcon, EuroIcon } from 'lucide-vue-next';
import type { OpportunityDto } from '@tfg/types';

const props = defineProps<{ opportunity: OpportunityDto }>();

const formattedAmount = computed(() => {
  if (props.opportunity.amount == null) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: props.opportunity.currency ?? 'EUR',
    maximumFractionDigits: 0,
  }).format(props.opportunity.amount);
});

const formattedDueDate = computed(() => {
  if (!props.opportunity.dueDate) return null;
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(
    new Date(props.opportunity.dueDate),
  );
});

const isOverdue = computed(() => {
  if (!props.opportunity.dueDate) return false;
  return new Date(props.opportunity.dueDate) < new Date();
});
</script>

<template>
  <Card class="cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow">
    <CardContent class="p-3 space-y-2">
      <NuxtLink
        :to="`/opportunities/${opportunity.id}`"
        class="block text-sm font-medium leading-tight hover:underline"
        @click.stop
      >
        {{ opportunity.title }}
      </NuxtLink>
      <div v-if="formattedAmount || formattedDueDate" class="flex items-center gap-3 flex-wrap">
        <span v-if="formattedAmount" class="flex items-center gap-1 text-xs text-muted-foreground">
          <EuroIcon class="size-3" />
          {{ formattedAmount }}
        </span>
        <span
          v-if="formattedDueDate"
          class="flex items-center gap-1 text-xs"
          :class="isOverdue ? 'text-destructive' : 'text-muted-foreground'"
        >
          <CalendarIcon class="size-3" />
          {{ formattedDueDate }}
        </span>
      </div>
    </CardContent>
  </Card>
</template>
