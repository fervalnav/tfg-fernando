<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { UserPlusIcon, TrashIcon } from 'lucide-vue-next';
import {
  useMembersQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from '~/modules/auth';
import { useAuthStore } from '~/modules/shared/stores/auth.store';
import { isFetchError } from '~/modules/shared/composables/useApi';

definePageMeta({ layout: 'settings', middleware: 'auth' });

const authStore = useAuthStore();
const showInviteDialog = ref(false);

const { data: members, isLoading } = useMembersQuery();
const { mutate: removeMember } = useRemoveMemberMutation();
const { mutate: updateRole } = useUpdateMemberRoleMutation();
const { mutate: inviteMember, isPending: isInviting } = useInviteMemberMutation();

const inviteSchema = toTypedSchema(
  z.object({
    email: z.string().email('Email inválido'),
    role: z.enum(['ADMIN', 'MEMBER']),
  }),
);

const inviteForm = useForm({
  validationSchema: inviteSchema,
  initialValues: { role: 'MEMBER' as const },
});

const onInvite = inviteForm.handleSubmit((values) => {
  inviteMember(values, {
    onSuccess: () => {
      toast.success('Invitación enviada');
      showInviteDialog.value = false;
      inviteForm.resetForm();
    },
    onError: (error) => {
      if (isFetchError(error, 409)) {
        toast.error('El usuario ya es miembro de esta cuenta');
        return;
      }
      toast.error('Error al enviar la invitación');
    },
  });
});

function handleRemove(userId: string) {
  removeMember(userId, {
    onSuccess: () => toast.success('Miembro eliminado'),
    onError: () => toast.error('Error al eliminar el miembro'),
  });
}

function handleRoleChange(userId: string, role: string) {
  updateRole(
    { userId, payload: { role: role as 'ADMIN' | 'MEMBER' } },
    {
      onSuccess: () => toast.success('Rol actualizado'),
      onError: () => toast.error('Error al actualizar el rol'),
    },
  );
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-foreground">Miembros de la cuenta</h1>
      <Dialog v-model:open="showInviteDialog">
        <DialogTrigger as-child>
          <Button>
            <UserPlusIcon class="mr-2 size-4" />
            Invitar miembro
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar a un miembro</DialogTitle>
            <DialogDescription>
              Se enviará un email de invitación a la dirección indicada.
            </DialogDescription>
          </DialogHeader>
          <form class="space-y-4 mt-4" @submit="onInvite">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="miembro@empresa.com" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ value, handleChange }" name="role">
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select :model-value="value" @update:model-value="handleChange">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MEMBER">Miembro</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <DialogFooter>
              <Button type="button" variant="outline" @click="showInviteDialog = false">
                Cancelar
              </Button>
              <Button type="submit" :disabled="isInviting">
                {{ isInviting ? 'Enviando...' : 'Enviar invitación' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <div class="bg-card rounded-xl border">
      <div v-if="isLoading" class="p-6 text-center text-muted-foreground text-sm">Cargando miembros...</div>

      <div v-else-if="!members?.length" class="p-6 text-center text-muted-foreground text-sm">
        No hay miembros en esta cuenta.
      </div>

      <ul v-else class="divide-y">
        <li v-for="member in members" :key="member.id" class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-3">
            <Avatar class="size-9">
              <AvatarImage :src="member.user.avatarUrl ?? undefined" alt="Avatar" />
              <AvatarFallback class="text-sm font-medium">
                {{ member.user.firstName?.charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-medium">
                {{ member.user.firstName }} {{ member.user.lastName }}
                <span v-if="member.userId === authStore.currentUser?.id" class="text-xs text-muted-foreground ml-1">(tú)</span>
              </p>
              <p class="text-xs text-muted-foreground">{{ member.user.email }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Select
              :model-value="member.role"
              :disabled="member.userId === authStore.currentUser?.id"
              @update:model-value="(val) => val && handleRoleChange(member.userId, val as 'ADMIN' | 'MEMBER')"
            >
              <SelectTrigger class="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Miembro</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Button
              v-if="member.userId !== authStore.currentUser?.id"
              variant="ghost"
              size="sm"
              class="text-destructive hover:text-destructive"
              @click="handleRemove(member.userId)"
            >
              <TrashIcon class="mr-1 size-4" />
              Eliminar
            </Button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
