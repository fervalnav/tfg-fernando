import { useAuthStore } from '~/modules/shared/stores/auth.store';

export default defineNuxtPlugin(async () => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  await authStore.init();
});
