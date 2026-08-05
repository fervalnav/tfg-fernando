import { setActivePinia, createPinia } from 'pinia';
import { computed, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { AuthResponseDto, LoginPayload, RegisterPayload } from '@tfg/types';
import { useAuthStore } from './auth.store';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

mockNuxtImport('useRuntimeConfig', () => () => ({
  public: { apiUrl: 'http://localhost:3000' },
}));

const user: AuthResponseDto['user'] = {
  id: 'user-id',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: null,
  createdAt: '2026-07-28T12:00:00.000Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    fetchMock.mockReset();
    vi.stubGlobal('$fetch', fetchMock);
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
  });

  it.each([
    ['login', { email: 'ada@example.com', password: 'secret' }],
    [
      'register',
      {
        id: 'user-id',
        accountId: 'account-id',
        email: 'ada@example.com',
        password: 'secret',
        firstName: 'Ada',
        lastName: 'Lovelace',
        accountName: 'Analytical Engines',
      },
    ],
  ] as const)('stores the authenticated session after %s', async (action, payload) => {
    fetchMock.mockResolvedValue({ user, accountId: 'account-id' });
    const store = useAuthStore();

    if (action === 'login') await store.login(payload as LoginPayload);
    else await store.register(payload as RegisterPayload);

    expect(store.currentUser).toEqual(user);
    expect(store.currentAccountId).toBe('account-id');
    expect(store.isAuthenticated).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      `/auth/${action}`,
      expect.objectContaining({
        baseURL: 'http://localhost:3000/api',
        method: 'POST',
        body: payload,
        credentials: 'include',
      }),
    );
  });

  it('clears stale state when session initialization fails', async () => {
    const store = useAuthStore();
    store.setUser(user);
    fetchMock.mockRejectedValue(new Error('Unauthorized'));

    await store.init();

    expect(store.currentUser).toBeNull();
    expect(store.currentAccountId).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('clears local state even when the logout request fails', async () => {
    fetchMock.mockResolvedValueOnce({ user, accountId: 'account-id' });
    const store = useAuthStore();
    await store.init();
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    await expect(store.logout()).rejects.toThrow('Network error');

    expect(store.currentUser).toBeNull();
    expect(store.currentAccountId).toBeNull();
  });

  it('updates the selected account only after a successful switch', async () => {
    const store = useAuthStore();
    fetchMock.mockResolvedValue(undefined);

    await store.switchAccount('new-account-id');

    expect(store.currentAccountId).toBe('new-account-id');
    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/switch-account',
      expect.objectContaining({ body: { accountId: 'new-account-id' } }),
    );
  });
});
