import { useQuery } from '@tanstack/vue-query';
import type { AccountMemberDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useMembersQuery = () => {
  const api = useApi();

  return useQuery<AccountMemberDto[], Error>({
    queryKey: ['members'],
    queryFn: () => api<AccountMemberDto[]>('/auth/account/members'),
  });
};
