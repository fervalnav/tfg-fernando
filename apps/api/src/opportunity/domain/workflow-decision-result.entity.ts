import type { WorkflowDecisionStatus } from '@tfg/types';
import { AggregateRoot } from '@/shared/domain/aggregate-root';
import {
  WorkflowDecisionEvaluatedEvent,
  WorkflowDecisionEvaluationRequestedEvent,
} from './events/opportunity-workflow.events';

export type WorkflowDecisionResultPrimitives = {
  id: string;
  accountId: string;
  opportunityId: string;
  workflowStepId: string;
  status: WorkflowDecisionStatus;
  evidence: string | null;
  evaluatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class WorkflowDecisionResult extends AggregateRoot {
  private constructor(private readonly data: WorkflowDecisionResultPrimitives) {
    super();
  }

  static create(
    params: Pick<WorkflowDecisionResultPrimitives, 'id' | 'accountId' | 'opportunityId' | 'workflowStepId'>,
  ): WorkflowDecisionResult {
    const now = new Date();
    const result = new WorkflowDecisionResult({
      ...params,
      status: 'PENDING',
      evidence: null,
      evaluatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    result.recordEvaluationRequested();
    return result;
  }

  static fromPrimitives(data: WorkflowDecisionResultPrimitives): WorkflowDecisionResult {
    return new WorkflowDecisionResult(data);
  }

  static createEvaluated(
    params: Pick<WorkflowDecisionResultPrimitives, 'id' | 'accountId' | 'opportunityId' | 'workflowStepId'>,
    status: Exclude<WorkflowDecisionStatus, 'PENDING'>,
    evidence: string | null,
  ): WorkflowDecisionResult {
    const now = new Date();
    return new WorkflowDecisionResult({
      ...params,
      status,
      evidence,
      evaluatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  requestEvaluation(): void {
    this.data.status = 'PENDING';
    this.data.evidence = null;
    this.data.evaluatedAt = null;
    this.data.updatedAt = new Date();
    this.recordEvaluationRequested();
  }

  resolve(status: Exclude<WorkflowDecisionStatus, 'PENDING'>, evidence: string | null): void {
    const now = new Date();
    this.data.status = status;
    this.data.evidence = evidence;
    this.data.evaluatedAt = now;
    this.data.updatedAt = now;
    this.record(
      new WorkflowDecisionEvaluatedEvent(
        this.data.opportunityId,
        this.data.accountId,
        this.data.workflowStepId,
        status,
        evidence,
      ),
    );
  }

  applyEvaluation(status: Exclude<WorkflowDecisionStatus, 'PENDING'>, evidence: string | null): void {
    const now = new Date();
    this.data.status = status;
    this.data.evidence = evidence;
    this.data.evaluatedAt = now;
    this.data.updatedAt = now;
  }

  private recordEvaluationRequested(): void {
    this.record(
      new WorkflowDecisionEvaluationRequestedEvent(
        this.data.opportunityId,
        this.data.accountId,
        this.data.workflowStepId,
      ),
    );
  }

  toPrimitives(): WorkflowDecisionResultPrimitives {
    return { ...this.data };
  }

  get id(): string {
    return this.data.id;
  }
  get workflowStepId(): string {
    return this.data.workflowStepId;
  }
  get status(): WorkflowDecisionStatus {
    return this.data.status;
  }
}
