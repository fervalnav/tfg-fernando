import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import type { AddSummaryToOpportunityPayload } from '@tfg/types';

export class AddSummaryToOpportunityDto implements AddSummaryToOpportunityPayload {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsUUID('all') summaryTemplateId!: string;
}
