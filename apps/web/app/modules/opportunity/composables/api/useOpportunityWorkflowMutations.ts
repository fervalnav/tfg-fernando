import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { AssignOpportunityWorkflowPayload } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

function useInvalidateOpportunityWorkflow() {
  const queryClient = useQueryClient();
  return async (opportunityId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'detail', opportunityId] }),
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'workflow', opportunityId] }),
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'kanban'] }),
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'list'] }),
    ]);
  };
}

export const useAssignOpportunityWorkflowMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateOpportunityWorkflow();
  return useMutation({
    mutationFn: (params: AssignOpportunityWorkflowPayload & { opportunityId: string; replace: boolean }) =>
      api(`/opportunities/${params.opportunityId}/workflow`, {
        method: params.replace ? 'PATCH' : 'POST',
        body: { workflowId: params.workflowId },
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

type WorkflowActionMutationParams = {
  opportunityId: string;
  actionId: string;
  operation: 'complete' | 'skip' | 'retry';
};

export const useWorkflowActionMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateOpportunityWorkflow();
  return useMutation({
    mutationFn: (params: WorkflowActionMutationParams) =>
      api(`/opportunities/${params.opportunityId}/workflow/actions/${params.actionId}/${params.operation}`, {
        method: 'POST',
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};

export const useReEvaluateWorkflowDecisionMutation = () => {
  const api = useApi();
  const invalidate = useInvalidateOpportunityWorkflow();
  return useMutation({
    mutationFn: (params: { opportunityId: string; workflowStepId: string }) =>
      api(`/opportunities/${params.opportunityId}/workflow/decisions/${params.workflowStepId}/re-evaluate`, {
        method: 'POST',
      }),
    onSuccess: (_, params) => invalidate(params.opportunityId),
  });
};
