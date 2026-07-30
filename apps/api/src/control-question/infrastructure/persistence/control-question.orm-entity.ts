import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import type { AiGenerationStatus, AnswerType, ControlQuestionAnswer } from '@tfg/types';
import { ControlQuestion } from '../../domain/control-question.entity';

@Entity({ tableName: 'control_questions' })
export class ControlQuestionOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'uuid', fieldName: 'opportunity_id' }) opportunityId!: string;
  @Property({ type: 'uuid', fieldName: 'default_control_question_id' }) defaultControlQuestionId!: string;
  @Property({ type: 'text' }) question!: string;
  @Property({ type: 'varchar', length: 10, fieldName: 'answer_type' }) answerType!: AnswerType;
  @Property({ type: 'text', nullable: true, fieldName: 'pass_condition_prompt' }) passConditionPrompt!: string | null;
  @Property({ type: 'json', nullable: true }) answer!: ControlQuestionAnswer;
  @Property({ type: 'varchar', length: 20, fieldName: 'ai_status', default: 'IDLE' })
  aiStatus!: AiGenerationStatus;
  @Property({ type: 'text', nullable: true, fieldName: 'ai_error' }) aiError!: string | null;
  @Property({ type: 'text', nullable: true, fieldName: 'ai_evidence' }) aiEvidence!: string | null;
  @Property({ type: 'boolean', nullable: true, fieldName: 'ai_passed' }) aiPassed!: boolean | null;
  @Property({ type: 'datetime', nullable: true, fieldName: 'ai_generated_at' }) aiGeneratedAt!: Date | null;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(params: ReturnType<ControlQuestion['toPrimitives']>) {
    Object.assign(this, params);
  }

  toDomainEntity(): ControlQuestion {
    return ControlQuestion.fromPrimitives(this);
  }
}
