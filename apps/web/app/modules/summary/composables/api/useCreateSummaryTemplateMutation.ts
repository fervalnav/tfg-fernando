import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CreateSummaryTemplatePayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useCreateSummaryTemplateMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSummaryTemplatePayload) =>
      api('/summaries/templates', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary-templates'] });
    },
  });
};
