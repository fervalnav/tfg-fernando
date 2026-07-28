<script setup lang="ts">
import type { AccountMemberDto, OpportunityDto } from '@tfg/types';
import { LoaderCircleIcon, UserPlusIcon, UsersIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useUpdateOpportunityMutation } from '../composables/api/useUpdateOpportunityMutation';

const props = defineProps<{
  opportunity: OpportunityDto;
  members: AccountMemberDto[];
}>();

const isOpen = ref(false);
const selectedUserIds = ref<string[]>([]);
const { mutate: updateOpportunity, isPending } = useUpdateOpportunityMutation();

watch(
  () => props.opportunity.responsibleUserIds,
  (userIds) => {
    selectedUserIds.value = [...userIds];
  },
  { immediate: true },
);

const selectedMembers = computed(() =>
  selectedUserIds.value
    .map((userId) => props.members.find((member) => member.userId === userId))
    .filter((member): member is AccountMemberDto => Boolean(member)),
);

const label = computed(() => {
  if (!selectedMembers.value.length && !props.opportunity.responsibleTeamIds.length) return 'Sin responsables';
  if (selectedMembers.value.length === 1 && props.opportunity.responsibleTeamIds.length === 0) {
    const member = selectedMembers.value[0];
    return member ? `${member.user.firstName} ${member.user.lastName}` : '1 responsable';
  }
  return `${selectedMembers.value.length + props.opportunity.responsibleTeamIds.length} responsables`;
});

function initials(member: AccountMemberDto): string {
  return `${member.user.firstName[0] ?? ''}${member.user.lastName[0] ?? ''}`.toUpperCase();
}

function toggleMember(userId: string, checked: boolean | 'indeterminate'): void {
  if (checked === true) {
    selectedUserIds.value = [...new Set([...selectedUserIds.value, userId])];
    return;
  }
  selectedUserIds.value = selectedUserIds.value.filter((id) => id !== userId);
}

function handleSave(): void {
  updateOpportunity(
    {
      id: props.opportunity.id,
      responsibleUserIds: selectedUserIds.value,
      responsibleTeamIds: props.opportunity.responsibleTeamIds,
    },
    {
      onSuccess: () => {
        toast.success('Responsables actualizados');
        isOpen.value = false;
      },
      onError: () => toast.error('No se pudieron actualizar los responsables'),
    },
  );
}
</script>

<template>
  <DropdownMenu v-model:open="isOpen">
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="h-9 gap-2 px-2 text-muted-foreground">
        <span v-if="selectedMembers.length" class="flex -space-x-2">
          <Avatar
            v-for="member in selectedMembers.slice(0, 3)"
            :key="member.userId"
            class="size-7 border-2 border-background"
          >
            <AvatarImage v-if="member.user.avatarUrl" :src="member.user.avatarUrl" />
            <AvatarFallback class="text-[10px]">{{ initials(member) }}</AvatarFallback>
          </Avatar>
        </span>
        <UsersIcon v-else class="size-4" />
        <span class="hidden max-w-40 truncate sm:inline">{{ label }}</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-72">
      <DropdownMenuLabel class="flex items-center gap-2">
        <UserPlusIcon class="size-4" />
        Asignar responsables
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <div v-if="members.length" class="max-h-64 overflow-y-auto">
        <DropdownMenuCheckboxItem
          v-for="member in members"
          :key="member.userId"
          :model-value="selectedUserIds.includes(member.userId)"
          class="gap-2"
          @update:model-value="(checked) => toggleMember(member.userId, checked)"
        >
          <Avatar class="size-7">
            <AvatarImage v-if="member.user.avatarUrl" :src="member.user.avatarUrl" />
            <AvatarFallback class="text-[10px]">{{ initials(member) }}</AvatarFallback>
          </Avatar>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm">{{ member.user.firstName }} {{ member.user.lastName }}</span>
            <span class="block truncate text-xs text-muted-foreground">{{ member.user.email }}</span>
          </span>
        </DropdownMenuCheckboxItem>
      </div>
      <p v-else class="px-2 py-4 text-center text-sm text-muted-foreground">No hay miembros disponibles.</p>

      <template v-if="opportunity.responsibleTeamIds.length">
        <DropdownMenuSeparator />
        <p class="px-2 py-2 text-xs text-muted-foreground">
          {{ opportunity.responsibleTeamIds.length }} equipos asignados se conservarán.
        </p>
      </template>

      <DropdownMenuSeparator />
      <div class="p-1">
        <Button class="w-full" size="sm" :disabled="isPending" @click="handleSave">
          <LoaderCircleIcon v-if="isPending" class="mr-2 size-4 animate-spin" />
          Guardar responsables
        </Button>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
