export type AnswerType = 'TEXT' | 'BOOLEAN';

export type DefaultControlQuestionDto = {
  id: string;
  accountId: string;
  question: string;
  answerType: AnswerType;
  passConditionPrompt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDefaultControlQuestionPayload = {
  id: string;
  question: string;
  answerType: AnswerType;
  passConditionPrompt?: string;
};

export type UpdateDefaultControlQuestionPayload = {
  question?: string;
  answerType?: AnswerType;
  passConditionPrompt?: string | null;
};

export type ControlQuestionAnswer = string | boolean | null;

export type ControlQuestionDto = {
  id: string;
  accountId: string;
  opportunityId: string;
  defaultControlQuestionId: string;
  question: string;
  answerType: AnswerType;
  passConditionPrompt: string | null;
  answer: ControlQuestionAnswer;
  aiStatus: AiGenerationStatus;
  aiError: string | null;
  aiEvidence: string | null;
  aiPassed: boolean | null;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnswerControlQuestionPayload = {
  answer: Exclude<ControlQuestionAnswer, null>;
};

export type AddControlQuestionToOpportunityPayload = {
  id: string;
  defaultControlQuestionId: string;
};
import type { AiGenerationStatus } from './ai';
