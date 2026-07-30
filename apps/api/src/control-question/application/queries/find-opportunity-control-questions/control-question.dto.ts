import { ApiProperty } from '@nestjs/swagger';
import type {
  AiGenerationStatus,
  AnswerType,
  ControlQuestionAnswer,
  ControlQuestionDto as IControlQuestionDto,
} from '@tfg/types';
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
  @ApiProperty() aiStatus!: AiGenerationStatus;
  @ApiProperty({ nullable: true }) aiError!: string | null;
  @ApiProperty({ nullable: true }) aiEvidence!: string | null;
  @ApiProperty({ nullable: true }) aiPassed!: boolean | null;
  @ApiProperty({ nullable: true }) aiGeneratedAt!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: ControlQuestion): ControlQuestionDto {
    const dto = new ControlQuestionDto();
    const primitives = entity.toPrimitives();
    Object.assign(dto, {
      ...primitives,
      aiGeneratedAt: primitives.aiGeneratedAt?.toISOString() ?? null,
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    });
    return dto;
  }
}
