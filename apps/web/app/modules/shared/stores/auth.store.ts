import { defineStore } from 'pinia';
import type { UserDto, AuthResponseDto, LoginPayload, RegisterPayload } from '@tfg/types';

function getBaseURL(): string {
  const config = useRuntimeConfig();
  return `${config.public.apiUrl as string}/api`;
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserDto | null>(null);
  const currentAccountId = ref<string | null>(null);

  const isAuthenticated = computed(() => currentUser.value !== null);

  async function init(): Promise<void> {
    try {
      const response = await $fetch<AuthResponseDto>('/auth/me', {
        baseURL: getBaseURL(),
        credentials: 'include',
      });
      currentUser.value = response.user;
      currentAccountId.value = response.accountId;
    } catch {
      currentUser.value = null;
      currentAccountId.value = null;
    }
  }

  async function login(payload: LoginPayload): Promise<void> {
    const response = await $fetch<AuthResponseDto>('/auth/login', {
      baseURL: getBaseURL(),
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
    currentUser.value = response.user;
    currentAccountId.value = response.accountId;
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const response = await $fetch<AuthResponseDto>('/auth/register', {
      baseURL: getBaseURL(),
      method: 'POST',
      body: payload,
      credentials: 'include',
    });
    currentUser.value = response.user;
    currentAccountId.value = response.accountId;
  }

  async function logout(): Promise<void> {
    try {
      await $fetch('/auth/logout', {
        baseURL: getBaseURL(),
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      currentUser.value = null;
      currentAccountId.value = null;
    }
  }

  async function refresh(): Promise<void> {
    await $fetch('/auth/refresh', {
      baseURL: getBaseURL(),
      method: 'POST',
      credentials: 'include',
    });
  }

  async function switchAccount(accountId: string): Promise<void> {
    await $fetch('/auth/switch-account', {
      baseURL: getBaseURL(),
      method: 'POST',
      body: { accountId },
      credentials: 'include',
    });
    currentAccountId.value = accountId;
  }

  function setUser(user: UserDto): void {
    currentUser.value = user;
  }

  return {
    currentUser,
    currentAccountId,
    isAuthenticated,
    init,
    login,
    register,
    logout,
    refresh,
    switchAccount,
    setUser,
  };
});
