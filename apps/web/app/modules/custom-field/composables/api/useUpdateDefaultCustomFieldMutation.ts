import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { UpdateDefaultCustomFieldPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useUpdateDefaultCustomFieldMutation = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateDefaultCustomFieldPayload) =>
      api(`/custom-fields/defaults/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-custom-fields'] });
    },
  });
};
