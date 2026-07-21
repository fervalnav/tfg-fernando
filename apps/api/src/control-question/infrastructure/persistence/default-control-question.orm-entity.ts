import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import type { AnswerType } from '../../domain/default-control-question.entity';
import { DefaultControlQuestion } from '../../domain/default-control-question.entity';

@Entity({ tableName: 'default_control_questions' })
export class DefaultControlQuestionOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'text' }) question!: string;
  @Property({ type: 'varchar', length: 10, fieldName: 'answer_type' }) answerType!: AnswerType;
  @Property({ type: 'text', nullable: true, fieldName: 'pass_condition_prompt' }) passConditionPrompt!: string | null;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(p: {
    id: string;
    accountId: string;
    question: string;
    answerType: AnswerType;
    passConditionPrompt: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    Object.assign(this, p);
  }

  toDomainEntity(): DefaultControlQuestion {
    return DefaultControlQuestion.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      question: this.question,
      answerType: this.answerType,
      passConditionPrompt: this.passConditionPrompt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
