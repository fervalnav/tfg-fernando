<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { useAcceptInvitationMutation } from '~/modules/auth';
import { isFetchError } from '~/modules/shared/composables/useApi';

definePageMeta({ layout: 'auth' });

const route = useRoute();
const token = computed(() => route.query['token'] as string | undefined);

const schema = toTypedSchema(
  z.object({
    firstName: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().min(1, 'El apellido es obligatorio'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
  }),
);

const form = useForm({ validationSchema: schema });
const { mutate: acceptInvitation, isPending } = useAcceptInvitationMutation();

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
      <h1 class="text-2xl font-bold text-foreground">Aceptar invitacion</h1>
      <p class="text-muted-foreground mt-2">Completa tu registro para acceder</p>
    </div>

    <div v-if="!token" class="bg-card rounded-xl border p-6 shadow-sm text-center">
      <p class="text-destructive">Token de invitación no encontrado.</p>
      <NuxtLink to="/auth/login" class="text-primary hover:underline text-sm mt-2 block"> Volver al login </NuxtLink>
    </div>

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

        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Procesando...' : 'Aceptar invitacion' }}
        </Button>
      </form>
    </div>
  </div>
</template>
