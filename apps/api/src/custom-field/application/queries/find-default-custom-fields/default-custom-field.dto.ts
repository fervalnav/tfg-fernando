import { ApiProperty } from '@nestjs/swagger';
import type { DefaultCustomFieldDto as IDefaultCustomFieldDto, CustomFieldType } from '@tfg/types';
import type { DefaultCustomField } from '../../../domain/default-custom-field.entity';

export class DefaultCustomFieldDto implements IDefaultCustomFieldDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() type!: CustomFieldType;
  @ApiProperty({ type: [String] }) classifiers!: string[];
  @ApiProperty() canSelectMultiple!: boolean;
  @ApiProperty() automatic!: boolean;
  @ApiProperty({ nullable: true }) aiPrompt!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: DefaultCustomField): DefaultCustomFieldDto {
    const dto = new DefaultCustomFieldDto();
    dto.id = entity.id;
    dto.accountId = entity.accountId;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.type = entity.type;
    dto.classifiers = entity.classifiers;
    dto.canSelectMultiple = entity.canSelectMultiple;
    dto.automatic = entity.automatic;
    dto.aiPrompt = entity.aiPrompt;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
