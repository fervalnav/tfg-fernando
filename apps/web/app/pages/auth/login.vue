<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useLoginMutation } from '~/modules/auth';
import { LiaWordmark } from '~/modules/shared';
import { isFetchError } from '~/modules/shared/composables/useApi';
import { requiredEmail, requiredString } from '~/modules/shared/lib/formValidation';

definePageMeta({ layout: 'auth', middleware: 'guest' });

const route = useRoute();
const redirectTo = computed(() => route.query['redirect'] as string | undefined);

const schema = toTypedSchema(
  z.object({
    email: requiredEmail(),
    password: requiredString('La contraseña es obligatoria'),
  }),
);

const form = useForm({ validationSchema: schema });
const { mutate: login, isPending } = useLoginMutation();
const loginError = ref<string | null>(null);

watch([() => form.values.email, () => form.values.password], () => {
  loginError.value = null;
});

const onSubmit = form.handleSubmit((values) => {
  login(values, {
    onSuccess: () => {
      loginError.value = null;
      return navigateTo(redirectTo.value ?? '/');
    },
    onError: (error) => {
      if (isFetchError(error, 401)) {
        loginError.value = 'Email o contraseña incorrectos';
        return;
      }
      loginError.value = 'No se pudo iniciar sesión. Inténtalo de nuevo.';
    },
  });
});
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <LiaWordmark class="mb-6 justify-center" />
      <h1 class="text-2xl font-bold text-foreground">Iniciar sesión</h1>
      <p class="text-muted-foreground mt-2">Accede a tu cuenta</p>
    </div>

    <div class="bg-card rounded-xl border p-6 shadow-sm">
      <form class="space-y-4" @submit="onSubmit">
        <p
          v-if="loginError"
          role="alert"
          class="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {{ loginError }}
        </p>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="tu@email.com" autocomplete="email" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" autocomplete="current-password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </Button>
      </form>
    </div>

    <p class="text-center text-sm text-muted-foreground mt-4">
      ¿No tienes cuenta?
      <NuxtLink
        :to="{ path: '/auth/register', query: redirectTo ? { redirect: redirectTo } : {} }"
        class="text-primary hover:underline"
      >
        Regístrate
      </NuxtLink>
    </p>
  </div>
</template>
