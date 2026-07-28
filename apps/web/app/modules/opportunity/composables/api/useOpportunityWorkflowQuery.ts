import { useQuery } from '@tanstack/vue-query';
import type { OpportunityWorkflowDto } from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

export const useOpportunityWorkflowQuery = (
  opportunityId: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean>,
) => {
  const api = useApi();
  return useQuery<OpportunityWorkflowDto, Error>({
    queryKey: ['opportunities', 'workflow', opportunityId],
    queryFn: () => api<OpportunityWorkflowDto>(`/opportunities/${toValue(opportunityId)}/workflow`),
    enabled: computed(() => Boolean(toValue(opportunityId)) && toValue(enabled)),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1000;
      const currentStep = data.workflow.steps.find((step) => step.id === data.currentStepId);
      const currentActions = data.actions.filter((action) => action.workflowStepId === data.currentStepId);
      const isInitializing = Boolean(currentStep?.actions.length && currentStep.actions.length > currentActions.length);
      const hasRunningAction = currentActions.some((action) => action.status === 'IN_PROGRESS');
      const hasPendingDecision = data.decisions.some(
        (decision) => decision.workflowStepId === data.currentStepId && decision.status === 'PENDING',
      );
      return isInitializing || hasRunningAction || hasPendingDecision ? 1500 : false;
    },
  });
};
