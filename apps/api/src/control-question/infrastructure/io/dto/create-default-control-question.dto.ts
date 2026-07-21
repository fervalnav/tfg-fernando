import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AnswerType } from '../../../domain/default-control-question.entity';

export class CreateDefaultControlQuestionDto {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsString() @MinLength(1) question!: string;
  @ApiProperty({ enum: ['TEXT', 'BOOLEAN'] }) @IsIn(['TEXT', 'BOOLEAN']) answerType!: AnswerType;
  @ApiPropertyOptional() @IsOptional() @IsString() passConditionPrompt?: string;
}
