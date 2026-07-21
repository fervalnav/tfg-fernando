import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdateSummaryTemplatePayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdateSummaryTemplateMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateSummaryTemplatePayload) =>
      api(`/summaries/templates/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary-templates'] });
    },
  });
};
