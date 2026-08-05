import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import authMiddleware from './auth';
import guestMiddleware from './guest';

const state = vi.hoisted(() => ({ isAuthenticated: false }));
const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

vi.mock('~/modules/shared/stores/auth.store', () => ({
  useAuthStore: () => state,
}));

mockNuxtImport('navigateTo', () => navigateToMock);

describe('authentication route middleware', () => {
  beforeEach(() => {
    state.isAuthenticated = false;
    navigateToMock.mockReset();
  });

  it('redirects an unauthenticated user away from protected pages', () => {
    authMiddleware({} as never, {} as never);

    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it('allows an authenticated user to enter protected pages', () => {
    state.isAuthenticated = true;

    expect(authMiddleware({} as never, {} as never)).toBeUndefined();
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('redirects an authenticated user away from guest-only pages', () => {
    state.isAuthenticated = true;
    guestMiddleware({} as never, {} as never);

    expect(navigateToMock).toHaveBeenCalledWith('/');
  });

  it('allows an unauthenticated user to enter guest-only pages', () => {
    expect(guestMiddleware({} as never, {} as never)).toBeUndefined();
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
