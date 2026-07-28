<script setup lang="ts">
import type { OpportunityDto } from '@tfg/types';
import { LoaderCircleIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useUpdateOpportunityMutation } from '../composables/api/useUpdateOpportunityMutation';

const props = defineProps<{ opportunity: OpportunityDto }>();
const open = defineModel<boolean>('open', { default: false });

const title = ref('');
const description = ref('');
const amount = ref('');
const currency = ref('EUR');
const dueDate = ref('');
const validationError = ref('');
const { mutate: updateOpportunity, isPending } = useUpdateOpportunityMutation();

watch(
  open,
  (isOpen) => {
    if (!isOpen) return;
    title.value = props.opportunity.title;
    description.value = props.opportunity.description ?? '';
    amount.value = props.opportunity.amount?.toString() ?? '';
    currency.value = props.opportunity.currency ?? 'EUR';
    dueDate.value = props.opportunity.dueDate?.slice(0, 10) ?? '';
    validationError.value = '';
  },
  { immediate: true },
);

function handleOpenChange(isOpen: boolean): void {
  open.value = isOpen;
}

function handleSubmit(): void {
  const normalizedTitle = title.value.trim();
  if (!normalizedTitle) {
    validationError.value = 'El título es obligatorio';
    return;
  }
  const normalizedAmount = amount.value.trim() ? Number(amount.value) : null;
  if (normalizedAmount !== null && (!Number.isFinite(normalizedAmount) || normalizedAmount < 0)) {
    validationError.value = 'El importe debe ser un número positivo';
    return;
  }

  validationError.value = '';
  updateOpportunity(
    {
      id: props.opportunity.id,
      title: normalizedTitle,
      description: description.value.trim() || null,
      amount: normalizedAmount,
      currency: currency.value,
      dueDate: dueDate.value || null,
    },
    {
      onSuccess: () => {
        toast.success('Oportunidad actualizada');
        open.value = false;
      },
      onError: () => toast.error('No se pudo actualizar la oportunidad'),
    },
  );
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar oportunidad</DialogTitle>
        <DialogDescription>Actualiza la información principal de la oportunidad.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="opportunity-title">Título</Label>
          <Input id="opportunity-title" v-model="title" />
        </div>

        <div class="space-y-2">
          <Label for="opportunity-description">Descripción</Label>
          <Input id="opportunity-description" v-model="description" placeholder="Descripción opcional" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2 space-y-2">
            <Label for="opportunity-amount">Importe</Label>
            <Input id="opportunity-amount" v-model="amount" type="number" min="0" step="0.01" placeholder="0" />
          </div>
          <div class="space-y-2">
            <Label for="opportunity-currency">Moneda</Label>
            <Select v-model="currency">
              <SelectTrigger id="opportunity-currency"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="opportunity-due-date">Fecha límite</Label>
          <Input id="opportunity-due-date" v-model="dueDate" type="date" />
        </div>

        <p v-if="validationError" class="text-sm text-destructive">{{ validationError }}</p>

        <DialogFooter>
          <Button type="button" variant="outline" @click="open = false">Cancelar</Button>
          <Button type="submit" :disabled="isPending">
            <LoaderCircleIcon v-if="isPending" class="mr-2 size-4 animate-spin" />
            Guardar cambios
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
