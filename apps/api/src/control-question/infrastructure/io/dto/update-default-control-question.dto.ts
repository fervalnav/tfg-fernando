import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { AnswerType } from '../../../domain/default-control-question.entity';

export class UpdateDefaultControlQuestionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) question?: string;
  @ApiPropertyOptional({ enum: ['TEXT', 'BOOLEAN'] }) @IsOptional() @IsIn(['TEXT', 'BOOLEAN']) answerType?: AnswerType;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() passConditionPrompt?: string | null;
}
