import { EventBus } from '@nestjs/cqrs';
import { OpportunityFinder, WorkflowStepActionRepository } from '@/opportunity';
import { WorkflowStepAction } from '@/opportunity/domain/workflow-step-action.entity';
import { AttachmentRepository } from '../domain/attachment.repository';
import { AttachmentStorageService } from '../domain/attachment-storage.service';
import { Attachment } from '../domain/attachment.entity';
import { CreateAttachmentCommand } from './commands/create-attachment';
import { CreateAttachmentHandler } from './commands/create-attachment/create-attachment.handler';
import { AttachmentDto } from './queries/find-opportunity-attachments/attachment.dto';
import { OpportunityAttachmentDocumentsService } from './services/opportunity-attachment-documents.service';

describe('Attachment application', () => {
  const accountId = '0198f6b3-1fd7-7fba-8e79-53161b649956';
  const opportunityId = '0198f6b3-1fd7-7fba-8e79-53161b649957';
  const actionId = '0198f6b3-1fd7-7fba-8e79-53161b649958';
  const attachmentId = '0198f6b3-1fd7-7fba-8e79-53161b649959';

  it('stores the PDF and completes its workflow action with the attachment target', async () => {
    const saved: unknown[] = [];
    const action = WorkflowStepAction.create({
      id: actionId,
      accountId,
      opportunityId,
      workflowStepId: 'step-id',
      defaultWorkflowStepActionId: 'default-action-id',
      name: 'Adjuntar PCAP',
      targetType: 'attachment',
      targetId: null,
      metadata: null,
      position: 1,
    });
    const upload = jest.fn().mockResolvedValue(undefined);
    const storage = {
      upload,
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as AttachmentStorageService;
    const handler = new CreateAttachmentHandler(
      {
        findById: jest.fn().mockResolvedValue(null),
        save: jest.fn((attachment) => {
          saved.push(attachment);
          return Promise.resolve();
        }),
        delete: jest.fn().mockResolvedValue(undefined),
      } as unknown as AttachmentRepository,
      storage,
      { find: jest.fn().mockResolvedValue({ workflowStepId: 'step-id' }) } as unknown as OpportunityFinder,
      {
        findById: jest.fn().mockResolvedValue(action),
        save: jest.fn().mockResolvedValue(undefined),
      } as unknown as WorkflowStepActionRepository,
      { publishAll: jest.fn() } as unknown as EventBus,
    );

    await handler.execute(
      new CreateAttachmentCommand(
        attachmentId,
        accountId,
        opportunityId,
        actionId,
        'PCAP.pdf',
        null,
        'application/pdf',
        4,
        Buffer.from('%PDF'),
      ),
    );

    expect(upload).toHaveBeenCalledWith(expect.stringContaining(attachmentId), Buffer.from('%PDF'), 'application/pdf');
    expect(saved).toHaveLength(1);
    expect(action.toPrimitives()).toEqual(expect.objectContaining({ status: 'COMPLETED', targetId: attachmentId }));
  });

  it('loads the original buffer when preparing AI documents', async () => {
    const createdAt = Temporal.Now.instant();
    const service = new OpportunityAttachmentDocumentsService(
      {
        findByOpportunityId: jest.fn().mockResolvedValue([
          {
            toPrimitives: () => ({
              name: 'PPTP.pdf',
              mimeType: 'application/pdf',
              fileKey: 'document-key',
              createdAt,
              updatedAt: createdAt,
            }),
          },
        ]),
      } as unknown as AttachmentRepository,
      { download: jest.fn().mockResolvedValue(Buffer.from('%PDF')) } as unknown as AttachmentStorageService,
    );

    await expect(service.find(opportunityId, accountId)).resolves.toEqual([
      {
        filename: 'PPTP.pdf',
        mediaType: 'application/pdf',
        data: Buffer.from('%PDF'),
      },
    ]);
  });

  it('does not expose the internal MinIO key in the response DTO', () => {
    const dto = AttachmentDto.fromEntity(
      Attachment.create({
        id: attachmentId,
        accountId,
        opportunityId,
        workflowStepActionId: null,
        name: 'PCAP.pdf',
        description: null,
        mimeType: 'application/pdf',
        size: 4,
        fileKey: 'private/internal/key',
      }),
    );

    expect(dto).not.toHaveProperty('fileKey');
  });
});
