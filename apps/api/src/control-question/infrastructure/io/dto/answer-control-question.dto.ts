import { IsDefined } from 'class-validator';
import type { AnswerControlQuestionPayload, ControlQuestionAnswer } from '@tfg/types';

export class AnswerControlQuestionDto implements AnswerControlQuestionPayload {
  @IsDefined()
  answer!: Exclude<ControlQuestionAnswer, null>;
}
