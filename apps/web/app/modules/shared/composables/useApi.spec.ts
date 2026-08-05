import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { isFetchError, useApi } from './useApi';

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport('useRuntimeConfig', () => () => ({ public: { apiUrl: 'http://localhost:3000' } }));
mockNuxtImport('navigateTo', () => navigateToMock);

describe('useApi', () => {
  const rawFetch = vi.fn();
  const fetchFactory = Object.assign(vi.fn(), { create: vi.fn(() => rawFetch) });

  beforeEach(() => {
    rawFetch.mockReset();
    fetchFactory.create.mockClear();
    navigateToMock.mockReset();
    vi.stubGlobal('$fetch', fetchFactory);
  });

  it('returns the retried response after refreshing an expired session', async () => {
    const unauthorized = Object.assign(new Error('Unauthorized'), { status: 401 });
    rawFetch.mockRejectedValueOnce(unauthorized).mockResolvedValueOnce(undefined).mockResolvedValueOnce({ ok: true });

    await expect(useApi()<{ ok: boolean }>('/pipelines')).resolves.toEqual({ ok: true });

    expect(rawFetch).toHaveBeenNthCalledWith(1, '/pipelines', undefined);
    expect(rawFetch).toHaveBeenNthCalledWith(2, '/auth/refresh', { method: 'POST' });
    expect(rawFetch).toHaveBeenNthCalledWith(3, '/pipelines', undefined);
  });

  it('redirects to login when refreshing the session fails', async () => {
    const unauthorized = Object.assign(new Error('Unauthorized'), { status: 401 });
    const refreshError = Object.assign(new Error('Refresh failed'), { statusCode: 401 });
    rawFetch.mockRejectedValueOnce(unauthorized).mockRejectedValueOnce(refreshError);

    await expect(useApi()('/pipelines')).rejects.toBe(refreshError);
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it('recognizes the HTTP status variants exposed by ofetch', () => {
    expect(isFetchError(Object.assign(new Error(), { status: 409 }), 409)).toBe(true);
    expect(isFetchError(Object.assign(new Error(), { statusCode: 409 }), 409)).toBe(true);
    expect(isFetchError(Object.assign(new Error(), { response: { status: 409 } }), 409)).toBe(true);
    expect(isFetchError(new Error(), 409)).toBe(false);
  });
});
