<script setup lang="ts">
import { toast } from 'vue-sonner';
import { useJoinViaInvitationMutation } from '~/modules/auth';
import { isFetchError } from '~/modules/shared/composables/useApi';
import { useAuthStore } from '~/modules/shared/stores/auth.store';

definePageMeta({ layout: 'auth' });

const route = useRoute();
const token = computed(() => route.query['token'] as string | undefined);
const authStore = useAuthStore();

onMounted(() => {
  if (authStore.isAuthenticated) return;

  const redirectPath = `/auth/accept-invitation${token.value ? `?token=${encodeURIComponent(token.value)}` : ''}`;
  navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
});

const { mutate: joinViaInvitation, isPending } = useJoinViaInvitationMutation();

const handleJoin = () => {
  if (!token.value) {
    toast.error('Token de invitación inválido');
    return;
  }

  joinViaInvitation(
    { token: token.value },
    {
      onSuccess: () => navigateTo('/'),
      onError: (error) => {
        if (isFetchError(error, 401)) {
          toast.error('La invitación no es válida o ha expirado');
          return;
        }
        if (isFetchError(error, 409)) {
          toast.error('Ya eres miembro de esta cuenta');
          return;
        }
        toast.error('Error inesperado');
      },
    },
  );
};
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold text-foreground">Aceptar invitacion</h1>
      <p class="text-muted-foreground mt-2">Hola, {{ authStore.currentUser?.firstName }}. Haz clic para unirte a la cuenta.</p>
    </div>

    <div v-if="!token" class="bg-card rounded-xl border p-6 shadow-sm text-center">
      <p class="text-destructive">Token de invitación no encontrado.</p>
      <NuxtLink to="/" class="text-primary hover:underline text-sm mt-2 block">Volver al inicio</NuxtLink>
    </div>

    <div v-else class="bg-card rounded-xl border p-6 shadow-sm">
      <Button class="w-full" :disabled="isPending" @click="handleJoin">
        {{ isPending ? 'Procesando...' : 'Unirse a la cuenta' }}
      </Button>
    </div>
  </div>
</template>
