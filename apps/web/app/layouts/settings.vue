<script setup lang="ts">
import { HomeIcon, UserIcon, UsersIcon, ChevronsUpDownIcon, SettingsIcon, LogOutIcon, SunIcon, MoonIcon } from 'lucide-vue-next';
import { useTheme } from '~/modules/shared/composables/useTheme';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '~/modules/shared/components/ui/sidebar';
import { useAuthStore } from '~/modules/shared/stores/auth.store';
import { useLogoutMutation } from '~/modules/auth';

const authStore = useAuthStore();
const { mutate: logout } = useLogoutMutation();
const { isDark, toggleDark } = useTheme();

function handleLogout() {
  logout(undefined, {
    onSuccess: () => navigateTo('/auth/login'),
  });
}

const userInitials = computed(() => {
  const first = authStore.currentUser?.firstName?.charAt(0) ?? '';
  const last = authStore.currentUser?.lastName?.charAt(0) ?? '';
  return (first + last).toUpperCase();
});
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader class="px-2 py-3">
        <div class="flex items-center justify-center h-8">
          <NuxtLink to="/" class="flex items-center">
            <img
              src="/images/logos/logoA_tendios_white.svg"
              alt="Tendios"
              class="h-7 group-data-[collapsible=icon]:hidden"
            >
            <img
              src="/images/logos/tendios-icono.svg"
              alt="Tendios"
              class="h-7 hidden group-data-[collapsible=icon]:block"
            >
          </NuxtLink>
        </div>
      </SidebarHeader>

      <SidebarContent class="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton as-child tooltip="Inicio">
              <NuxtLink to="/">
                <HomeIcon />
                <span>Inicio</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div class="mt-4 px-2">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Configuración
          </p>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton as-child tooltip="Perfil">
              <NuxtLink to="/settings/profile">
                <UserIcon />
                <span>Perfil</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton as-child tooltip="Cuenta y miembros">
              <NuxtLink to="/settings/account">
                <UsersIcon />
                <span>Cuenta y miembros</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter class="px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar class="size-8 shrink-0">
                    <AvatarImage :src="authStore.currentUser?.avatarUrl ?? undefined" alt="Avatar" />
                    <AvatarFallback class="text-xs">{{ userInitials }}</AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">
                      {{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}
                    </span>
                    <span class="truncate text-xs text-muted-foreground">
                      {{ authStore.currentUser?.email }}
                    </span>
                  </div>
                  <ChevronsUpDownIcon class="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-56"
                side="top"
                align="end"
                :side-offset="4"
              >
                <DropdownMenuItem @click="navigateTo('/settings/profile')">
                  <SettingsIcon class="mr-2 size-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem @click="toggleDark()">
                  <SunIcon v-if="isDark" class="mr-2 size-4" />
                  <MoonIcon v-else class="mr-2 size-4" />
                  {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive" @click="handleLogout">
                  <LogOutIcon class="mr-2 size-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header class="flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <SidebarTrigger />
        <h1 class="font-semibold">Configuración</h1>
      </header>
      <div class="flex-1 overflow-auto">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
