import { ApiProperty } from '@nestjs/swagger';
import type { CustomFieldDto as ICustomFieldDto, CustomFieldType, CustomFieldValue } from '@tfg/types';
import type { CustomField } from '../../../domain/custom-field.entity';

export class CustomFieldDto implements ICustomFieldDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() opportunityId!: string;
  @ApiProperty() defaultCustomFieldId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() type!: CustomFieldType;
  @ApiProperty({ type: [String] }) classifiers!: string[];
  @ApiProperty() canSelectMultiple!: boolean;
  @ApiProperty() automatic!: boolean;
  @ApiProperty({ nullable: true }) aiPrompt!: string | null;
  @ApiProperty({ nullable: true }) value!: CustomFieldValue;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: CustomField): CustomFieldDto {
    const primitives = entity.toPrimitives();
    const dto = new CustomFieldDto();
    Object.assign(dto, {
      ...primitives,
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    });
    return dto;
  }
}
