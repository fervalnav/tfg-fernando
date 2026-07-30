import type { AiGenerationStatus, AnswerType, ControlQuestionAnswer } from '@tfg/types';

type Primitives = {
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
  aiGeneratedAt: Date | null;
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
    private _aiStatus: AiGenerationStatus,
    private _aiError: string | null,
    private _aiEvidence: string | null,
    private _aiPassed: boolean | null,
    private _aiGeneratedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(
    params: Omit<
      Primitives,
      'answer' | 'aiStatus' | 'aiError' | 'aiEvidence' | 'aiPassed' | 'aiGeneratedAt' | 'createdAt' | 'updatedAt'
    >,
  ): ControlQuestion {
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
      'IDLE',
      null,
      null,
      null,
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
      data.aiStatus,
      data.aiError,
      data.aiEvidence,
      data.aiPassed,
      data.aiGeneratedAt,
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

  requestAiGeneration(): boolean {
    if (this._aiStatus === 'PENDING' || this._aiStatus === 'PROCESSING') return false;
    this._aiStatus = 'PENDING';
    this._aiError = null;
    this._updatedAt = new Date();
    return true;
  }

  startAiGeneration(): boolean {
    if (this._aiStatus !== 'PENDING') return false;
    this._aiStatus = 'PROCESSING';
    this._aiError = null;
    this._updatedAt = new Date();
    return true;
  }

  completeAiGeneration(answer: Exclude<ControlQuestionAnswer, null>, evidence: string, passed: boolean | null): void {
    this.answer(answer);
    this._aiStatus = 'COMPLETED';
    this._aiError = null;
    this._aiEvidence = evidence.trim();
    this._aiPassed = passed;
    this._aiGeneratedAt = new Date();
  }

  failAiGeneration(message: string): void {
    this._aiStatus = 'FAILED';
    this._aiError = message;
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
      aiStatus: this._aiStatus,
      aiError: this._aiError,
      aiEvidence: this._aiEvidence,
      aiPassed: this._aiPassed,
      aiGeneratedAt: this._aiGeneratedAt,
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
