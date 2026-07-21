import { ApiProperty } from '@nestjs/swagger';
import type { DefaultControlQuestionDto as IDefaultControlQuestionDto, AnswerType } from '@tfg/types';
import type { DefaultControlQuestion } from '../../../domain/default-control-question.entity';

export class DefaultControlQuestionDto implements IDefaultControlQuestionDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() question!: string;
  @ApiProperty() answerType!: AnswerType;
  @ApiProperty({ nullable: true }) passConditionPrompt!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: DefaultControlQuestion): DefaultControlQuestionDto {
    const dto = new DefaultControlQuestionDto();
    dto.id = entity.id;
    dto.accountId = entity.accountId;
    dto.question = entity.question;
    dto.answerType = entity.answerType;
    dto.passConditionPrompt = entity.passConditionPrompt;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
