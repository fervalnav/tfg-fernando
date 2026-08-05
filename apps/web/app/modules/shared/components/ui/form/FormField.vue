<script setup lang="ts">
import { Field } from 'vee-validate';

defineProps<{ name: string }>();
</script>

<template>
  <Field :name="name" v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData ?? {}" />
    </template>
  </Field>
</template>
