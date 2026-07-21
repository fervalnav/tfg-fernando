import { AggregateRoot } from '@/shared/domain/aggregate-root';

export type AnswerType = 'TEXT' | 'BOOLEAN';

type Primitives = {
  id: string;
  accountId: string;
  question: string;
  answerType: AnswerType;
  passConditionPrompt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class DefaultControlQuestion extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private _question: string,
    private _answerType: AnswerType,
    private _passConditionPrompt: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(params: {
    id: string;
    accountId: string;
    question: string;
    answerType: AnswerType;
    passConditionPrompt?: string;
  }): DefaultControlQuestion {
    const now = new Date();
    return new DefaultControlQuestion(
      params.id,
      params.accountId,
      params.question,
      params.answerType,
      params.passConditionPrompt ?? null,
      now,
      now,
    );
  }

  static fromPrimitives(data: Primitives): DefaultControlQuestion {
    return new DefaultControlQuestion(
      data.id,
      data.accountId,
      data.question,
      data.answerType,
      data.passConditionPrompt,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(params: { question?: string; answerType?: AnswerType; passConditionPrompt?: string | null }): void {
    if (params.question !== undefined) this._question = params.question;
    if (params.answerType !== undefined) this._answerType = params.answerType;
    if (params.passConditionPrompt !== undefined) this._passConditionPrompt = params.passConditionPrompt;
    this._updatedAt = new Date();
  }

  toPrimitives(): Primitives {
    return {
      id: this._id,
      accountId: this._accountId,
      question: this._question,
      answerType: this._answerType,
      passConditionPrompt: this._passConditionPrompt,
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
  get question() {
    return this._question;
  }
  get answerType() {
    return this._answerType;
  }
  get passConditionPrompt() {
    return this._passConditionPrompt;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
