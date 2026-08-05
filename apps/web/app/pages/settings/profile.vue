<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { SaveIcon } from 'lucide-vue-next';
import { useUpdateProfileMutation, useUpdateAvatarMutation } from '~/modules/auth';
import { useAuthStore } from '~/modules/shared/stores/auth.store';
import { requiredString, validateAvatarFile } from '~/modules/shared/lib/formValidation';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const authStore = useAuthStore();

const schema = toTypedSchema(
  z.object({
    firstName: requiredString('El nombre es obligatorio'),
    lastName: requiredString('El apellido es obligatorio'),
  }),
);

const form = useForm({
  validationSchema: schema,
  initialValues: {
    firstName: authStore.currentUser?.firstName ?? '',
    lastName: authStore.currentUser?.lastName ?? '',
  },
});

const { mutate: updateProfile, isPending: isSavingProfile } = useUpdateProfileMutation();
const { mutate: updateAvatar, isPending: isUploadingAvatar } = useUpdateAvatarMutation();

const onSubmit = form.handleSubmit((values) => {
  updateProfile(values, {
    onSuccess: () => toast.success('Perfil actualizado'),
    onError: () => toast.error('Error al actualizar el perfil'),
  });
});

function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const validationError = validateAvatarFile(file);
  if (validationError) {
    input.value = '';
    toast.error(validationError);
    return;
  }

  updateAvatar(file, {
    onSuccess: () => toast.success('Avatar actualizado'),
    onError: () => toast.error('Error al subir el avatar'),
  });
}
</script>

<template>
  <div class="p-8 max-w-2xl">
    <h1 class="text-2xl font-bold text-foreground mb-6">Perfil</h1>

    <!-- Avatar -->
    <div class="bg-card rounded-xl border p-6 mb-6">
      <h2 class="text-sm font-medium text-foreground mb-4">Foto de perfil</h2>
      <div class="flex items-center gap-4">
        <Avatar class="size-16 text-xl">
          <AvatarImage v-if="authStore.currentUser?.avatarUrl" :src="authStore.currentUser.avatarUrl" alt="Avatar" />
          <AvatarFallback class="text-xl font-semibold">
            {{ authStore.currentUser?.firstName?.charAt(0) }}
          </AvatarFallback>
        </Avatar>
        <div>
          <label class="cursor-pointer">
            <span class="text-sm text-primary hover:underline">
              {{ isUploadingAvatar ? 'Subiendo...' : 'Cambiar foto' }}
            </span>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              :disabled="isUploadingAvatar"
              @change="handleAvatarChange"
            >
          </label>
          <p class="text-xs text-muted-foreground mt-1">JPG, PNG o WebP. Máx. 5 MB.</p>
        </div>
      </div>
    </div>

    <!-- Profile form -->
    <div class="bg-card rounded-xl border p-6">
      <h2 class="text-sm font-medium text-foreground mb-4">Datos personales</h2>
      <form class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div>
          <Label class="text-muted-foreground">Email</Label>
          <p class="text-sm mt-1">{{ authStore.currentUser?.email }}</p>
        </div>

        <Button type="submit" :disabled="isSavingProfile">
          <SaveIcon class="mr-2 size-4" />
          {{ isSavingProfile ? 'Guardando...' : 'Guardar cambios' }}
        </Button>
      </form>
    </div>
  </div>
</template>
