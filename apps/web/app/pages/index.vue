<script setup lang="ts">
import { useAuthStore } from '~/modules/shared/stores/auth.store';

definePageMeta({ middleware: 'auth' });

const authStore = useAuthStore();
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-foreground mb-2">Bienvenido, {{ authStore.currentUser?.firstName }}</h1>
    <p class="text-muted-foreground">Panel de inicio.</p>
  </div>
</template>
