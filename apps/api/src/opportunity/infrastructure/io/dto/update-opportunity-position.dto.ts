import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpdateOpportunityPositionDto {
  @ApiProperty() @IsNumber() sortPoints!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID('all') pipelineStatusId?: string;
}
