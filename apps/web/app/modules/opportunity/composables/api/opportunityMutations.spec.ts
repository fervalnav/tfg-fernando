import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateOpportunityMutation } from './useCreateOpportunityMutation';
import { useTransitionStatusMutation } from './useTransitionStatusMutation';
import { useUpdateOpportunityMutation } from './useUpdateOpportunityMutation';
import {
  useDeleteOpportunityAttachmentMutation,
  useDownloadOpportunityAttachmentMutation,
  useUploadOpportunityAttachmentMutation,
} from './useOpportunityAttachmentMutations';
import {
  useAnswerControlQuestionMutation,
  useGenerateControlQuestionMutation,
  useGenerateCustomFieldMutation,
  useGenerateSummaryMutation,
  useSetCustomFieldValueMutation,
  useUpdateSummaryResultMutation,
} from './useOpportunityQualificationMutations';
import { useAssignOpportunityWorkflowMutation, useWorkflowActionMutation } from './useOpportunityWorkflowMutations';

const { apiMock, invalidateQueriesMock, useMutationMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  invalidateQueriesMock: vi.fn().mockResolvedValue(undefined),
  useMutationMock: vi.fn((options: unknown) => options),
}));

vi.mock('@tanstack/vue-query', () => ({
  useMutation: useMutationMock,
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock('~/modules/shared/composables/useApi', () => ({
  useApi: () => apiMock,
}));

type MutationOptions<TParams> = {
  mutationFn: (params: TParams) => Promise<unknown>;
  onSuccess?: (result: unknown, params: TParams) => Promise<unknown> | unknown;
};

function mutation<TParams>(value: unknown): MutationOptions<TParams> {
  return value as MutationOptions<TParams>;
}

describe('opportunity API mutations', () => {
  beforeEach(() => {
    apiMock.mockReset().mockResolvedValue(undefined);
    invalidateQueriesMock.mockClear();
    useMutationMock.mockClear();
  });

  it('creates, edits and transitions opportunities at their HTTP boundaries', async () => {
    const create = mutation<Record<string, unknown>>(useCreateOpportunityMutation());
    const update = mutation<{ id: string; title: string }>(useUpdateOpportunityMutation());
    const transition = mutation<{ id: string; pipelineStatusId: string }>(useTransitionStatusMutation());

    await create.mutationFn({ id: 'opportunity-id', pipelineId: 'pipeline-id', title: 'Nueva' });
    await update.mutationFn({ id: 'opportunity-id', title: 'Editada' });
    await transition.mutationFn({ id: 'opportunity-id', pipelineStatusId: 'status-id' });

    expect(apiMock).toHaveBeenNthCalledWith(1, '/opportunities', {
      method: 'POST',
      body: { id: 'opportunity-id', pipelineId: 'pipeline-id', title: 'Nueva' },
    });
    expect(apiMock).toHaveBeenNthCalledWith(2, '/opportunities/opportunity-id', {
      method: 'PATCH',
      body: { title: 'Editada' },
    });
    expect(apiMock).toHaveBeenNthCalledWith(3, '/opportunities/opportunity-id/status', {
      method: 'PATCH',
      body: { pipelineStatusId: 'status-id' },
    });
  });

  it('assigns or replaces workflows and supports complete, skip and retry operations', async () => {
    const assign = mutation<{ opportunityId: string; workflowId: string; replace: boolean }>(
      useAssignOpportunityWorkflowMutation(),
    );
    const action = mutation<{ opportunityId: string; actionId: string; operation: 'complete' | 'skip' | 'retry' }>(
      useWorkflowActionMutation(),
    );

    await assign.mutationFn({ opportunityId: 'opp', workflowId: 'workflow', replace: false });
    await assign.mutationFn({ opportunityId: 'opp', workflowId: 'replacement', replace: true });
    for (const operation of ['complete', 'skip', 'retry'] as const) {
      await action.mutationFn({ opportunityId: 'opp', actionId: 'action', operation });
    }

    expect(apiMock).toHaveBeenNthCalledWith(1, '/opportunities/opp/workflow', {
      method: 'POST',
      body: { workflowId: 'workflow' },
    });
    expect(apiMock).toHaveBeenNthCalledWith(2, '/opportunities/opp/workflow', {
      method: 'PATCH',
      body: { workflowId: 'replacement' },
    });
    expect(apiMock).toHaveBeenCalledWith('/opportunities/opp/workflow/actions/action/retry', { method: 'POST' });
  });

  it('updates manual qualification values and requests every AI generation type', async () => {
    const answer = mutation<{ opportunityId: string; controlQuestionId: string; answer: string }>(
      useAnswerControlQuestionMutation(),
    );
    const field = mutation<{ opportunityId: string; customFieldId: string; value: string }>(
      useSetCustomFieldValueMutation(),
    );
    const summary = mutation<{ opportunityId: string; summaryId: string; result: string }>(
      useUpdateSummaryResultMutation(),
    );

    await answer.mutationFn({ opportunityId: 'opp', controlQuestionId: 'question', answer: 'Sí' });
    await field.mutationFn({ opportunityId: 'opp', customFieldId: 'field', value: '120 horas' });
    await summary.mutationFn({ opportunityId: 'opp', summaryId: 'summary', result: 'Resultado manual' });
    await mutation<{ opportunityId: string; controlQuestionId: string }>(
      useGenerateControlQuestionMutation(),
    ).mutationFn({ opportunityId: 'opp', controlQuestionId: 'question' });
    await mutation<{ opportunityId: string; customFieldId: string }>(useGenerateCustomFieldMutation()).mutationFn({
      opportunityId: 'opp',
      customFieldId: 'field',
    });
    await mutation<{ opportunityId: string; summaryId: string }>(useGenerateSummaryMutation()).mutationFn({
      opportunityId: 'opp',
      summaryId: 'summary',
    });

    expect(apiMock).toHaveBeenCalledWith('/opportunities/opp/control-questions/question', {
      method: 'PATCH',
      body: { answer: 'Sí' },
    });
    expect(apiMock).toHaveBeenCalledWith('/opportunities/opp/custom-fields/field', {
      method: 'PATCH',
      body: { value: '120 horas' },
    });
    expect(apiMock).toHaveBeenCalledWith('/opportunities/opp/summaries/summary/generate', { method: 'POST' });
  });

  it('builds multipart PDF uploads and invalidates attachment plus workflow views', async () => {
    const upload = mutation<{
      id: string;
      opportunityId: string;
      file: File;
      description?: string;
      workflowStepActionId?: string;
    }>(useUploadOpportunityAttachmentMutation());
    const file = new File(['%PDF'], 'pliego.pdf', { type: 'application/pdf' });
    const params = {
      id: 'attachment-id',
      opportunityId: 'opp',
      file,
      description: 'PCAP',
      workflowStepActionId: 'action-id',
    };

    await upload.mutationFn(params);
    const body = apiMock.mock.calls[0]?.[1]?.body as FormData;
    expect(apiMock.mock.calls[0]?.[0]).toBe('/opportunities/opp/attachments');
    expect(body.get('id')).toBe('attachment-id');
    expect(body.get('file')).toBe(file);
    expect(body.get('description')).toBe('PCAP');
    expect(body.get('workflowStepActionId')).toBe('action-id');

    await upload.onSuccess?.(undefined, params);
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['opportunities', 'attachments', 'opp'],
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['opportunities', 'workflow', 'opp'],
    });
  });

  it('uses account-scoped attachment URLs for download and deletion', async () => {
    const download = mutation<{ opportunityId: string; attachmentId: string }>(
      useDownloadOpportunityAttachmentMutation(),
    );
    const remove = mutation<{ opportunityId: string; attachmentId: string }>(useDeleteOpportunityAttachmentMutation());

    await download.mutationFn({ opportunityId: 'opp', attachmentId: 'attachment' });
    await remove.mutationFn({ opportunityId: 'opp', attachmentId: 'attachment' });

    expect(apiMock).toHaveBeenNthCalledWith(1, '/opportunities/opp/attachments/attachment/download-url');
    expect(apiMock).toHaveBeenNthCalledWith(2, '/opportunities/opp/attachments/attachment', {
      method: 'DELETE',
    });
  });
});
