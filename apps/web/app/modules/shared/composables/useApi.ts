import type { FetchOptions } from 'ofetch';

type ApiError = {
  statusCode: number;
  message: string;
};

let isRefreshing = false;

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = `${config.public.apiUrl as string}/api`;

  const apiFetch = $fetch.create({
    baseURL,
    credentials: 'include',
    onResponseError: async ({ request, response, options }) => {
      if (response.status !== 401) return;

      // Evitar bucle infinito en la llamada de refresh
      const url = typeof request === 'string' ? request : request.toString();
      if (url.includes('/auth/refresh') || url.includes('/auth/login')) return;

      if (isRefreshing) return;
      isRefreshing = true;

      try {
        await $fetch('/auth/refresh', {
          baseURL,
          method: 'POST',
          credentials: 'include',
        });

        // Reintentar la petición original
        const retryOptions: FetchOptions = {
          ...options,
          credentials: 'include',
        };
        await $fetch(request, retryOptions);
      } catch {
        // Refresh falló — redirigir a login
        await navigateTo('/auth/login');
      } finally {
        isRefreshing = false;
      }
    },
  });

  return apiFetch;
};

export function isFetchError(error: unknown, status: number): boolean {
  return error instanceof Error && 'status' in error && (error as { status: number }).status === status;
}

export type { ApiError };
