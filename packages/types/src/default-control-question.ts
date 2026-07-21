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
