import { ApiProperty } from '@nestjs/swagger';
import type { SummaryDto as ISummaryDto } from '@tfg/types';
import type { Summary } from '../../../domain/summary.entity';

export class SummaryDto implements ISummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() opportunityId!: string;
  @ApiProperty() summaryTemplateId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() prompt!: string;
  @ApiProperty({ nullable: true }) result!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: Summary): SummaryDto {
    const primitives = entity.toPrimitives();
    const dto = new SummaryDto();
    Object.assign(dto, {
      ...primitives,
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    });
    return dto;
  }
}
