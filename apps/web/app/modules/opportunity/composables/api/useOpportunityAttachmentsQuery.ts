import { useQuery } from '@tanstack/vue-query';
import type { AttachmentDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useOpportunityAttachmentsQuery = (opportunityId: MaybeRefOrGetter<string>) => {
  const api = useApi();
  return useQuery<AttachmentDto[], Error>({
    queryKey: ['opportunities', 'attachments', opportunityId],
    queryFn: () => api<AttachmentDto[]>(`/opportunities/${toValue(opportunityId)}/attachments`),
    enabled: computed(() => Boolean(toValue(opportunityId))),
  });
};
