<script setup lang="ts">
import { CalendarIcon, CircleDollarSignIcon, FileTextIcon, PencilIcon } from 'lucide-vue-next';
import type { OpportunityDto, PipelineDto } from '@tfg/types';

const props = defineProps<{ opportunity: OpportunityDto; pipeline?: PipelineDto }>();
const emit = defineEmits<{ edit: [] }>();

const formattedAmount = computed(() => {
  if (props.opportunity.amount == null) return 'Sin importe';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: props.opportunity.currency ?? 'EUR',
    maximumFractionDigits: 0,
  }).format(props.opportunity.amount);
});

const formattedDueDate = computed(() => {
  if (!props.opportunity.dueDate) return 'Sin fecha límite';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(props.opportunity.dueDate));
});
</script>

<template>
  <section>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold">Detalles</h2>
        <p class="mt-1 text-sm text-muted-foreground">Información general y comercial de la oportunidad.</p>
      </div>
      <Button variant="outline" @click="emit('edit')">
        <PencilIcon class="mr-2 size-4" />
        Editar
      </Button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader class="pb-3">
          <CardDescription class="flex items-center gap-2"><FileTextIcon class="size-4" /> Descripción</CardDescription>
        </CardHeader>
        <CardContent class="text-sm">
          {{ opportunity.description || 'No se ha añadido una descripción.' }}
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-3">
          <CardDescription class="flex items-center gap-2">
            <CircleDollarSignIcon class="size-4" /> Importe
          </CardDescription>
        </CardHeader>
        <CardContent class="text-lg font-semibold">{{ formattedAmount }}</CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-3">
          <CardDescription class="flex items-center gap-2"
            ><CalendarIcon class="size-4" /> Fecha límite</CardDescription
          >
        </CardHeader>
        <CardContent class="text-sm font-medium">{{ formattedDueDate }}</CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-3"><CardDescription>Pipeline</CardDescription></CardHeader>
        <CardContent class="text-sm font-medium">{{ pipeline?.name ?? 'Sin pipeline' }}</CardContent>
      </Card>
    </div>
  </section>
</template>
