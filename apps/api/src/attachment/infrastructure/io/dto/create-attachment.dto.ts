import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAttachmentDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUUID()
  workflowStepActionId?: string;
}
