import { ApiProperty } from '@nestjs/swagger';
import type { AnswerType, ControlQuestionAnswer, ControlQuestionDto as IControlQuestionDto } from '@tfg/types';
import type { ControlQuestion } from '../../../domain/control-question.entity';

export class ControlQuestionDto implements IControlQuestionDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() opportunityId!: string;
  @ApiProperty() defaultControlQuestionId!: string;
  @ApiProperty() question!: string;
  @ApiProperty() answerType!: AnswerType;
  @ApiProperty({ nullable: true }) passConditionPrompt!: string | null;
  @ApiProperty({ nullable: true }) answer!: ControlQuestionAnswer;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: ControlQuestion): ControlQuestionDto {
    const dto = new ControlQuestionDto();
    dto.id = entity.id;
    dto.accountId = entity.accountId;
    dto.opportunityId = entity.opportunityId;
    dto.defaultControlQuestionId = entity.defaultControlQuestionId;
    dto.question = entity.question;
    dto.answerType = entity.answerType;
    dto.passConditionPrompt = entity.passConditionPrompt;
    dto.answer = entity.answerValue;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
