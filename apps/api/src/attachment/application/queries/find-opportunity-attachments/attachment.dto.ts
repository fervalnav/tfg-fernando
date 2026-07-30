import { ApiProperty } from '@nestjs/swagger';
import type { AttachmentDto as IAttachmentDto } from '@tfg/types';
import type { Attachment } from '../../../domain/attachment.entity';

export class AttachmentDto implements IAttachmentDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() opportunityId!: string;
  @ApiProperty({ nullable: true }) workflowStepActionId!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() mimeType!: string;
  @ApiProperty() size!: number;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: Attachment): AttachmentDto {
    const data = entity.toPrimitives();
    const dto = new AttachmentDto();
    Object.assign(dto, {
      id: data.id,
      accountId: data.accountId,
      opportunityId: data.opportunityId,
      workflowStepActionId: data.workflowStepActionId,
      name: data.name,
      description: data.description,
      mimeType: data.mimeType,
      size: data.size,
      createdAt: data.createdAt.toString(),
      updatedAt: data.updatedAt.toString(),
    });
    return dto;
  }
}
