import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Length, Min, MinLength } from 'class-validator';

export class CreateOpportunityDto {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsString() @MinLength(1) title!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) amount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @ApiProperty() @IsUUID('all') pipelineId!: string;
  @ApiProperty() @IsUUID('all') pipelineStatusId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID('all') workflowId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?: string;
}
