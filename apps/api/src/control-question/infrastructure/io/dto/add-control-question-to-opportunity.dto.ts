import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import type { AddControlQuestionToOpportunityPayload } from '@tfg/types';

export class AddControlQuestionToOpportunityDto implements AddControlQuestionToOpportunityPayload {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsUUID('all') defaultControlQuestionId!: string;
}
