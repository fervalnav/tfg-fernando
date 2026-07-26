import { ApiProperty } from '@nestjs/swagger';
import type { PipelineStatusTotalsDto as IPipelineStatusTotalsDto } from '@tfg/types';
import type { PipelineStatusTotal } from '../../../domain/opportunity.repository';

export class PipelineStatusTotalsDto implements IPipelineStatusTotalsDto {
  @ApiProperty() statusId!: string;
  @ApiProperty() count!: number;
  @ApiProperty() totalAmount!: number;

  static fromRaw(raw: PipelineStatusTotal): PipelineStatusTotalsDto {
    const dto = new PipelineStatusTotalsDto();
    dto.statusId = raw.statusId;
    dto.count = raw.count;
    dto.totalAmount = raw.totalAmount;
    return dto;
  }
}
