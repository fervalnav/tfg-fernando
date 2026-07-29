import type { AnswerType, ControlQuestionAnswer } from '@tfg/types';

type Primitives = {
  id: string;
  accountId: string;
  opportunityId: string;
  defaultControlQuestionId: string;
  question: string;
  answerType: AnswerType;
  passConditionPrompt: string | null;
  answer: ControlQuestionAnswer;
  createdAt: Date;
  updatedAt: Date;
};

export class ControlQuestion {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private readonly _opportunityId: string,
    private readonly _defaultControlQuestionId: string,
    private readonly _question: string,
    private readonly _answerType: AnswerType,
    private readonly _passConditionPrompt: string | null,
    private _answer: ControlQuestionAnswer,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(params: Omit<Primitives, 'answer' | 'createdAt' | 'updatedAt'>): ControlQuestion {
    const now = new Date();
    return new ControlQuestion(
      params.id,
      params.accountId,
      params.opportunityId,
      params.defaultControlQuestionId,
      params.question,
      params.answerType,
      params.passConditionPrompt,
      null,
      now,
      now,
    );
  }

  static fromPrimitives(data: Primitives): ControlQuestion {
    return new ControlQuestion(
      data.id,
      data.accountId,
      data.opportunityId,
      data.defaultControlQuestionId,
      data.question,
      data.answerType,
      data.passConditionPrompt,
      data.answer,
      data.createdAt,
      data.updatedAt,
    );
  }

  answer(value: Exclude<ControlQuestionAnswer, null>): void {
    const isValidText = this._answerType === 'TEXT' && typeof value === 'string';
    const isValidBoolean = this._answerType === 'BOOLEAN' && typeof value === 'boolean';
    if (!isValidText && !isValidBoolean) throw new Error('La respuesta no coincide con el tipo de la pregunta');
    this._answer = value;
    this._updatedAt = new Date();
  }

  toPrimitives(): Primitives {
    return {
      id: this._id,
      accountId: this._accountId,
      opportunityId: this._opportunityId,
      defaultControlQuestionId: this._defaultControlQuestionId,
      question: this._question,
      answerType: this._answerType,
      passConditionPrompt: this._passConditionPrompt,
      answer: this._answer,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id() {
    return this._id;
  }
  get accountId() {
    return this._accountId;
  }
  get opportunityId() {
    return this._opportunityId;
  }
  get defaultControlQuestionId() {
    return this._defaultControlQuestionId;
  }
  get question() {
    return this._question;
  }
  get answerType() {
    return this._answerType;
  }
  get passConditionPrompt() {
    return this._passConditionPrompt;
  }
  get answerValue() {
    return this._answer;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
