import { ApiProperty } from '@nestjs/swagger';
import type { SummaryTemplateDto as ISummaryTemplateDto } from '@tfg/types';
import type { SummaryTemplate } from '../../../domain/summary-template.entity';

export class SummaryTemplateDto implements ISummaryTemplateDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() prompt!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: SummaryTemplate): SummaryTemplateDto {
    const dto = new SummaryTemplateDto();
    dto.id = entity.id;
    dto.accountId = entity.accountId;
    dto.name = entity.name;
    dto.prompt = entity.prompt;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
