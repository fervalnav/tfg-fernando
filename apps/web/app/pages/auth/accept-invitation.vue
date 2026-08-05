<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { useAcceptInvitationMutation, useJoinViaInvitationMutation } from '~/modules/auth';
import { isFetchError } from '~/modules/shared/composables/useApi';
import { useAuthStore } from '~/modules/shared/stores/auth.store';
import { requiredString } from '~/modules/shared/lib/formValidation';

definePageMeta({ layout: 'auth' });

const route = useRoute();
const token = computed(() => route.query['token'] as string | undefined);
const authStore = useAuthStore();

// — Flujo para usuario ya autenticado —
const { mutate: joinViaInvitation, isPending: isJoining } = useJoinViaInvitationMutation();

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

// — Flujo para usuario no registrado —
const schema = toTypedSchema(
  z.object({
    firstName: requiredString('El nombre es obligatorio'),
    lastName: requiredString('El apellido es obligatorio'),
    password: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(1, 'La contraseña es obligatoria')
      .min(8, 'Mínimo 8 caracteres'),
  }),
);

const form = useForm({ validationSchema: schema });
const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitationMutation();

const onSubmit = form.handleSubmit((values) => {
  if (!token.value) {
    toast.error('Token de invitación inválido');
    return;
  }

  acceptInvitation(
    { token: token.value, ...values },
    {
      onSuccess: () => navigateTo('/'),
      onError: (error) => {
        if (isFetchError(error, 401)) {
          toast.error('La invitación no es válida o ha expirado');
          return;
        }
        if (isFetchError(error, 409)) {
          toast.error('Ya existe una cuenta con ese email');
          return;
        }
        toast.error('Error inesperado');
      },
    },
  );
});
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <img src="/images/logos/logoA_tendios_darkblue.svg" alt="Logo" class="h-10 mx-auto mb-6" >
      <h1 class="text-2xl font-bold text-foreground">Aceptar invitacion</h1>
      <p class="text-muted-foreground mt-2">
        {{
          authStore.isAuthenticated
            ? `Hola, ${authStore.currentUser?.firstName}. Haz clic para unirte a la cuenta.`
            : 'Crea tu cuenta para unirte.'
        }}
      </p>
    </div>

    <div v-if="!token" class="bg-card rounded-xl border p-6 shadow-sm text-center">
      <p class="text-destructive">Token de invitación no encontrado.</p>
      <NuxtLink to="/" class="text-primary hover:underline text-sm mt-2 block">Volver al inicio</NuxtLink>
    </div>

    <!-- Usuario autenticado: solo unirse -->
    <div v-else-if="authStore.isAuthenticated" class="bg-card rounded-xl border p-6 shadow-sm">
      <Button class="w-full" :disabled="isJoining" @click="handleJoin">
        {{ isJoining ? 'Procesando...' : 'Unirse a la cuenta' }}
      </Button>
    </div>

    <!-- Usuario no registrado: formulario de registro sin accountName -->
    <div v-else class="bg-card rounded-xl border p-6 shadow-sm">
      <form class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Juan" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input placeholder="García" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" autocomplete="new-password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isAccepting">
          {{ isAccepting ? 'Creando cuenta...' : 'Crear cuenta y unirse' }}
        </Button>
      </form>

      <p class="text-center text-sm text-muted-foreground mt-4">
        ¿Ya tienes cuenta?
        <NuxtLink
          :to="{ path: '/auth/login', query: { redirect: `/auth/accept-invitation?token=${token}` } }"
          class="text-primary hover:underline"
        >
          Inicia sesion
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
