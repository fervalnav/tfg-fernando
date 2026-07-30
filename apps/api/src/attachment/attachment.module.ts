import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OpportunityModule } from '@/opportunity';
import { StorageModule } from '@/shared/infrastructure/storage/storage.module';
import { AttachmentRepository } from './domain/attachment.repository';
import { AttachmentStorageService } from './domain/attachment-storage.service';
import { CreateAttachmentHandler } from './application/commands/create-attachment';
import { DeleteAttachmentHandler } from './application/commands/delete-attachment';
import { FindOpportunityAttachmentsHandler } from './application/queries/find-opportunity-attachments';
import { GetAttachmentDownloadUrlHandler } from './application/queries/get-attachment-download-url';
import { OpportunityAttachmentDocumentsService } from './application/services/opportunity-attachment-documents.service';
import { OpportunityAttachmentController } from './infrastructure/io/opportunity-attachment.controller';
import { AttachmentOrmEntity } from './infrastructure/persistence/attachment.orm-entity';
import { MikroOrmAttachmentRepository } from './infrastructure/persistence/mikro-orm-attachment.repository';
import { MinioAttachmentStorageService } from './infrastructure/storage/minio-attachment-storage.service';

@Module({
  imports: [
    CqrsModule,
    StorageModule,
    forwardRef(() => OpportunityModule),
    MikroOrmModule.forFeature([AttachmentOrmEntity]),
  ],
  controllers: [OpportunityAttachmentController],
  providers: [
    CreateAttachmentHandler,
    DeleteAttachmentHandler,
    FindOpportunityAttachmentsHandler,
    GetAttachmentDownloadUrlHandler,
    OpportunityAttachmentDocumentsService,
    { provide: AttachmentRepository, useClass: MikroOrmAttachmentRepository },
    { provide: AttachmentStorageService, useClass: MinioAttachmentStorageService },
  ],
  exports: [OpportunityAttachmentDocumentsService],
})
export class AttachmentModule {}
