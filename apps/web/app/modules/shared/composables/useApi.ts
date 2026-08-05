import type { FetchOptions } from 'ofetch';

type ApiError = {
  statusCode: number;
  message: string;
};

export type ApiClient = <T = unknown>(request: string, options?: FetchOptions) => Promise<T>;

let refreshPromise: Promise<unknown> | null = null;

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = `${config.public.apiUrl as string}/api`;

  const apiFetch = $fetch.create({
    baseURL,
    credentials: 'include',
  }) as unknown as ApiClient;

  const client: ApiClient = async <T = unknown>(request: string, options?: FetchOptions): Promise<T> => {
    try {
      return await apiFetch<T>(request, options);
    } catch (error) {
      const isAuthenticationRequest = request.includes('/auth/refresh') || request.includes('/auth/login');
      if (!isFetchError(error, 401) || isAuthenticationRequest) throw error;

      const activeRefresh = refreshPromise ?? apiFetch('/auth/refresh', { method: 'POST' });
      refreshPromise = activeRefresh;

      try {
        await activeRefresh;
        return await apiFetch<T>(request, options);
      } catch (refreshError) {
        await navigateTo('/auth/login');
        throw refreshError;
      } finally {
        if (refreshPromise === activeRefresh) refreshPromise = null;
      }
    }
  };

  return client;
};

export function isFetchError(error: unknown, status: number): boolean {
  if (!(error instanceof Error)) return false;

  const candidate = error as Error & {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
  };

  return candidate.status === status || candidate.statusCode === status || candidate.response?.status === status;
}

export type { ApiError };
