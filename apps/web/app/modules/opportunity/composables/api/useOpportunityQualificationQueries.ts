import { useQuery } from '@tanstack/vue-query';
import type {
  ControlQuestionDto,
  CustomFieldDto,
  DefaultControlQuestionDto,
  DefaultCustomFieldDto,
  PaginatedResult,
  SummaryDto,
  SummaryTemplateDto,
} from '@tfg/types';
import { useApi } from '~/modules/shared/composables/useApi';

const TEMPLATE_PAGE_SIZE = 100;

async function fetchAllTemplates<T>(api: ReturnType<typeof useApi>, endpoint: string): Promise<T[]> {
  const first = await api<PaginatedResult<T>>(`${endpoint}?page=1&limit=${TEMPLATE_PAGE_SIZE}`);
  const items = [...first.items];
  for (let page = 2; items.length < first.total; page += 1) {
    const result = await api<PaginatedResult<T>>(`${endpoint}?page=${page}&limit=${TEMPLATE_PAGE_SIZE}`);
    items.push(...result.items);
  }
  return items;
}

export const useOpportunityControlQuestionsQuery = (opportunityId: MaybeRefOrGetter<string>) => {
  const api = useApi();
  return useQuery<ControlQuestionDto[], Error>({
    queryKey: ['opportunities', 'qualification', opportunityId, 'control-questions'],
    queryFn: () => api<ControlQuestionDto[]>(`/opportunities/${toValue(opportunityId)}/control-questions`),
    enabled: computed(() => Boolean(toValue(opportunityId))),
  });
};

export const useOpportunityCustomFieldsQuery = (opportunityId: MaybeRefOrGetter<string>) => {
  const api = useApi();
  return useQuery<CustomFieldDto[], Error>({
    queryKey: ['opportunities', 'qualification', opportunityId, 'custom-fields'],
    queryFn: () => api<CustomFieldDto[]>(`/opportunities/${toValue(opportunityId)}/custom-fields`),
    enabled: computed(() => Boolean(toValue(opportunityId))),
  });
};

export const useOpportunitySummariesQuery = (opportunityId: MaybeRefOrGetter<string>) => {
  const api = useApi();
  return useQuery<SummaryDto[], Error>({
    queryKey: ['opportunities', 'qualification', opportunityId, 'summaries'],
    queryFn: () => api<SummaryDto[]>(`/opportunities/${toValue(opportunityId)}/summaries`),
    enabled: computed(() => Boolean(toValue(opportunityId))),
  });
};

export const useControlQuestionTemplatesQuery = () => {
  const api = useApi();
  return useQuery<DefaultControlQuestionDto[], Error>({
    queryKey: ['default-control-questions', 'all'],
    queryFn: () => fetchAllTemplates<DefaultControlQuestionDto>(api, '/control-questions/defaults'),
  });
};

export const useCustomFieldTemplatesQuery = () => {
  const api = useApi();
  return useQuery<DefaultCustomFieldDto[], Error>({
    queryKey: ['default-custom-fields', 'all'],
    queryFn: () => fetchAllTemplates<DefaultCustomFieldDto>(api, '/custom-fields/defaults'),
  });
};

export const useSummaryTemplatesForOpportunityQuery = () => {
  const api = useApi();
  return useQuery<SummaryTemplateDto[], Error>({
    queryKey: ['summary-templates', 'all'],
    queryFn: () => fetchAllTemplates<SummaryTemplateDto>(api, '/summaries/templates'),
  });
};
