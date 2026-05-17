import { useQuery } from '@tanstack/vue-query';
import type { MyAccountDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useMyAccountsQuery = () => {
  const api = useApi();
  return useQuery<MyAccountDto[], Error>({
    queryKey: ['my-accounts'],
    queryFn: () => api<MyAccountDto[]>('/auth/account/my-accounts'),
  });
};
