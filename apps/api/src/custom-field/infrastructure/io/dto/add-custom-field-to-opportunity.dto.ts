import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import type { AddCustomFieldToOpportunityPayload } from '@tfg/types';

export class AddCustomFieldToOpportunityDto implements AddCustomFieldToOpportunityPayload {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsUUID('all') defaultCustomFieldId!: string;
}
