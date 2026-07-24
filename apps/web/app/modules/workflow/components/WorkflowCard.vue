<script setup lang="ts">
import { MoreHorizontalIcon, PencilIcon, CopyIcon, Trash2Icon, ArrowRightIcon } from 'lucide-vue-next';
import type { WorkflowDto } from '@tfg/types';

defineProps<{ workflow: WorkflowDto }>();
defineEmits<{
  edit: [workflow: WorkflowDto];
  duplicate: [id: string];
  delete: [id: string];
}>();
</script>

<template>
  <div class="flex items-center gap-3 rounded-lg border bg-card p-4">
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium truncate">{{ workflow.name }}</p>
      <p class="text-xs text-muted-foreground mt-0.5">
        {{ workflow.stepsCount }} paso{{ workflow.stepsCount === 1 ? '' : 's' }}
        <span v-if="workflow.description" class="ml-2">· {{ workflow.description }}</span>
      </p>
    </div>
    <NuxtLink :to="`/settings/workflows/${workflow.id}`">
      <Button size="icon" variant="ghost" class="size-8 shrink-0">
        <ArrowRightIcon class="size-4" />
      </Button>
    </NuxtLink>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button size="icon" variant="ghost" class="size-8 shrink-0">
          <MoreHorizontalIcon class="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="$emit('edit', workflow)">
          <PencilIcon class="mr-2 size-4" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem @click="$emit('duplicate', workflow.id)">
          <CopyIcon class="mr-2 size-4" /> Duplicar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="text-destructive focus:text-destructive" @click="$emit('delete', workflow.id)">
          <Trash2Icon class="mr-2 size-4" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
