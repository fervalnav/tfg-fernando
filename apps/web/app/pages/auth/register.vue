<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { useRegisterMutation } from '~/modules/auth';
import { isFetchError } from '~/modules/shared/composables/useApi';

definePageMeta({ layout: 'auth', middleware: 'guest' });

const schema = toTypedSchema(
  z.object({
    firstName: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().min(1, 'El apellido es obligatorio'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    accountName: z.string().min(1, 'El nombre de la empresa es obligatorio'),
  }),
);

const form = useForm({ validationSchema: schema });
const { mutate: register, isPending } = useRegisterMutation();

const onSubmit = form.handleSubmit((values) => {
  register(values, {
    onSuccess: () => navigateTo('/'),
    onError: (error) => {
      if (isFetchError(error, 409)) {
        toast.error('Ya existe una cuenta con ese email');
        return;
      }
      toast.error('Error inesperado');
    },
  });
});
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <img src="/images/logos/logoA_tendios_darkblue.svg" alt="Logo" class="h-10 mx-auto mb-6" />
      <h1 class="text-2xl font-bold text-foreground">Crear cuenta</h1>
      <p class="text-muted-foreground mt-2">Empieza gratis hoy</p>
    </div>

    <div class="bg-card rounded-xl border p-6 shadow-sm">
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

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="tu@empresa.com" autocomplete="email" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" autocomplete="new-password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="accountName">
          <FormItem>
            <FormLabel>Nombre de la empresa</FormLabel>
            <FormControl>
              <Input placeholder="Mi Empresa S.L." v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Creando cuenta...' : 'Crear cuenta' }}
        </Button>
      </form>
    </div>

    <p class="text-center text-sm text-muted-foreground mt-4">
      ¿Ya tienes cuenta?
      <NuxtLink to="/auth/login" class="text-primary hover:underline"> Inicia sesion </NuxtLink>
    </p>
  </div>
</template>
