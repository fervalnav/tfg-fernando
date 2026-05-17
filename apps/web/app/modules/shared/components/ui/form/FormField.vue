<script setup lang="ts">
import { Field } from 'vee-validate';
</script>

<template>
  <Field v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </Field>
</template>
