import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type {
  AddControlQuestionToOpportunityPayload,
  AddCustomFieldToOpportunityPayload,
  AddSummaryToOpportunityPayload,
  AnswerControlQuestionPayload,
  SetCustomFieldValuePayload,
  UpdateSummaryResultPayload,
} from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

function useInvalidateQualification() {
  const queryClient = useQueryClient();
  return async (opportunityId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'qualification', opportunityId] }),
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'workflow', opportunityId] }),
    ]);
  };
}

export const useAnswerControlQuestionMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: AnswerControlQuestionPayload & { opportunityId: string; controlQuestionId: string }) =>
      api(`/opportunities/${params.opportunityId}/control-questions/${params.controlQuestionId}`, {
        method: 'PATCH',
        body: { answer: params.answer },
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useSetCustomFieldValueMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: SetCustomFieldValuePayload & { opportunityId: string; customFieldId: string }) =>
      api(`/opportunities/${params.opportunityId}/custom-fields/${params.customFieldId}`, {
        method: 'PATCH',
        body: { value: params.value },
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useUpdateSummaryResultMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: UpdateSummaryResultPayload & { opportunityId: string; summaryId: string }) =>
      api(`/opportunities/${params.opportunityId}/summaries/${params.summaryId}`, {
        method: 'PATCH',
        body: { result: params.result },
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useAddControlQuestionToOpportunityMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: AddControlQuestionToOpportunityPayload & { opportunityId: string }) =>
      api(`/opportunities/${params.opportunityId}/control-questions`, {
        method: 'POST',
        body: { id: params.id, defaultControlQuestionId: params.defaultControlQuestionId },
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useAddCustomFieldToOpportunityMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: AddCustomFieldToOpportunityPayload & { opportunityId: string }) =>
      api(`/opportunities/${params.opportunityId}/custom-fields`, {
        method: 'POST',
        body: { id: params.id, defaultCustomFieldId: params.defaultCustomFieldId },
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useAddSummaryToOpportunityMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: AddSummaryToOpportunityPayload & { opportunityId: string }) =>
      api(`/opportunities/${params.opportunityId}/summaries`, {
        method: 'POST',
        body: { id: params.id, summaryTemplateId: params.summaryTemplateId },
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useGenerateControlQuestionMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: { opportunityId: string; controlQuestionId: string }) =>
      api(`/opportunities/${params.opportunityId}/control-questions/${params.controlQuestionId}/generate`, {
        method: 'POST',
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useGenerateCustomFieldMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: { opportunityId: string; customFieldId: string }) =>
      api(`/opportunities/${params.opportunityId}/custom-fields/${params.customFieldId}/generate`, {
        method: 'POST',
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useGenerateSummaryMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateQualification();
  return useMutation({
    mutationFn: (params: { opportunityId: string; summaryId: string }) =>
      api(`/opportunities/${params.opportunityId}/summaries/${params.summaryId}/generate`, {
        method: 'POST',
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};
