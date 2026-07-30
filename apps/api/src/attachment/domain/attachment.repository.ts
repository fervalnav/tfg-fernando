import type { Attachment } from './attachment.entity';

export abstract class AttachmentRepository {
  abstract findById(id: string): Promise<Attachment | null>;
  abstract findByOpportunityId(opportunityId: string, accountId: string): Promise<Attachment[]>;
  abstract save(attachment: Attachment): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
