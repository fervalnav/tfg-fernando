export type AttachmentPrimitives = {
  id: string;
  accountId: string;
  opportunityId: string;
  workflowStepActionId: string | null;
  name: string;
  description: string | null;
  mimeType: string;
  size: number;
  fileKey: string;
  createdAt: Temporal.Instant;
  updatedAt: Temporal.Instant;
};

export class Attachment {
  private constructor(private readonly data: AttachmentPrimitives) {}

  static create(params: Omit<AttachmentPrimitives, 'createdAt' | 'updatedAt'>): Attachment {
    const now = Temporal.Now.instant();
    return new Attachment({ ...params, createdAt: now, updatedAt: now });
  }

  static fromPrimitives(data: AttachmentPrimitives): Attachment {
    return new Attachment(data);
  }

  toPrimitives(): AttachmentPrimitives {
    return { ...this.data };
  }

  get id(): string {
    return this.data.id;
  }

  get accountId(): string {
    return this.data.accountId;
  }

  get opportunityId(): string {
    return this.data.opportunityId;
  }

  get fileKey(): string {
    return this.data.fileKey;
  }
}
