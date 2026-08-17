<script setup lang="ts">
withDefaults(
  defineProps<{
    inverted?: boolean;
  }>(),
  {
    inverted: false,
  },
);
</script>

<template>
  <span
    class="inline-flex items-center gap-2 font-bold tracking-[0.16em]"
    :class="inverted ? 'text-white' : 'text-brand-navy'"
    aria-label="LIA"
  >
    <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-yellow text-brand-navy tracking-normal">
      L
    </span>
    <span class="group-data-[collapsible=icon]:hidden">LIA</span>
  </span>
</template>
