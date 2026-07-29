<script setup lang="ts">
import { OpportunityDetail, useOpportunityByIdQuery } from '~/modules/opportunity';
import type { OpportunityDetailSection } from '~/modules/opportunity';
import { usePipelineQuery } from '~/modules/pipeline';
import { useWorkflowsInfiniteQuery } from '~/modules/workflow';
import { useMembersQuery } from '~/modules/auth';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const opportunityId = computed(() => route.params['id'] as string);
const validSections: OpportunityDetailSection[] = [
  'details',
  'control-questions',
  'custom-fields',
  'summaries',
  'workflow',
];
const section = computed<OpportunityDetailSection>(() => {
  const requested = route.query['section'];
  return typeof requested === 'string' && validSections.includes(requested as OpportunityDetailSection)
    ? (requested as OpportunityDetailSection)
    : 'details';
});
const { data: opportunity, isLoading, isError } = useOpportunityByIdQuery(opportunityId);
const pipelineId = computed(() => opportunity.value?.pipelineId ?? '');
const { data: pipeline } = usePipelineQuery(pipelineId);
const { data: workflowPages } = useWorkflowsInfiniteQuery();
const workflows = computed(() => workflowPages.value?.pages.flatMap((page) => page.items) ?? []);
const { data: members } = useMembersQuery();
</script>

<template>
  <div v-if="isLoading" class="flex h-full items-center justify-center text-sm text-muted-foreground">
    Cargando oportunidad...
  </div>
  <div v-else-if="isError || !opportunity" class="flex h-full flex-col items-center justify-center gap-3">
    <p class="text-sm text-muted-foreground">No se ha podido cargar la oportunidad.</p>
    <Button variant="outline" @click="navigateTo('/opportunities')">Volver</Button>
  </div>
  <OpportunityDetail
    v-else
    :opportunity="opportunity"
    :pipeline="pipeline"
    :workflows="workflows"
    :members="members ?? []"
    :section="section"
  />
</template>
