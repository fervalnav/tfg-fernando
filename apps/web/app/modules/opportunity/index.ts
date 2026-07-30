// Components
export { default as OpportunityKanban } from './components/OpportunityKanban.vue';
export { default as OpportunityListTable } from './components/OpportunityListTable.vue';
export { default as OpportunityFiltersBar } from './components/OpportunityFiltersBar.vue';
export { default as OpportunityPipelineSelector } from './components/OpportunityPipelineSelector.vue';
export { default as OpportunityDetail } from './components/OpportunityDetail.vue';
export type { OpportunityDetailSection } from './opportunity-detail.types';

// Composables
export { useKanbanOpportunitiesQuery } from './composables/api/useKanbanOpportunitiesQuery';
export { usePipelineStatusTotalsQuery } from './composables/api/usePipelineStatusTotalsQuery';
export { useOpportunitiesQuery } from './composables/api/useOpportunitiesQuery';
export { useCreateOpportunityMutation } from './composables/api/useCreateOpportunityMutation';
export { useUpdateOpportunityMutation } from './composables/api/useUpdateOpportunityMutation';
export { useDeleteOpportunityMutation } from './composables/api/useDeleteOpportunityMutation';
export { useTransitionStatusMutation } from './composables/api/useTransitionStatusMutation';
export { useUpdatePositionMutation } from './composables/api/useUpdatePositionMutation';
export { useOpportunityFilters } from './composables/useOpportunityFilters';
export { useOpportunityByIdQuery } from './composables/api/useOpportunityByIdQuery';
export { useOpportunityAttachmentsQuery } from './composables/api/useOpportunityAttachmentsQuery';
export {
  useOpportunityControlQuestionsQuery,
  useOpportunityCustomFieldsQuery,
  useOpportunitySummariesQuery,
} from './composables/api/useOpportunityQualificationQueries';
export {
  useAnswerControlQuestionMutation,
  useSetCustomFieldValueMutation,
  useUpdateSummaryResultMutation,
  useGenerateControlQuestionMutation,
  useGenerateCustomFieldMutation,
  useGenerateSummaryMutation,
} from './composables/api/useOpportunityQualificationMutations';
