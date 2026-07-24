import { IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ActionTargetType } from '@tfg/types';

const ACTION_TARGET_TYPES: ActionTargetType[] = [
  'control_question',
  'custom_field',
  'summary',
  'task',
  'attachment',
  'email_notification',
  'opportunity_status_update',
];

export class CreateDefaultStepActionDto {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsIn(ACTION_TARGET_TYPES) targetType!: ActionTargetType;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID('all') targetId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsObject() metadata?: Record<string, unknown>;
  @ApiProperty() @IsInt() @Min(1) position!: number;
}
