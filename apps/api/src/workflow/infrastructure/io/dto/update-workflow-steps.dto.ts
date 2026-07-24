import { IsArray, IsIn, IsOptional, IsString, IsUUID, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WorkflowStepInputDto {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsIn(['step', 'decision']) type!: 'step' | 'decision';
  @ApiProperty({ required: false }) @IsOptional() @IsString() condition?: string;
  @ApiProperty() @IsInt() @Min(1) position!: number;
}

export class UpdateWorkflowStepsDto {
  @ApiProperty({ type: () => [WorkflowStepInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepInputDto)
  steps!: WorkflowStepInputDto[];
}
