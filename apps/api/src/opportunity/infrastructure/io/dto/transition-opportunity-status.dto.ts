import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class TransitionOpportunityStatusDto {
  @ApiProperty() @IsUUID('all') pipelineStatusId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsIn(['WON', 'LOST', 'DROPPED']) finalOutcomeType?:
    | 'WON'
    | 'LOST'
    | 'DROPPED';
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortPoints?: number;
}
