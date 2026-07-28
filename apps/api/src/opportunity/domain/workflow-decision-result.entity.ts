import type { WorkflowDecisionStatus } from '@tfg/types';

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

export class WorkflowDecisionResult {
  private constructor(private readonly data: WorkflowDecisionResultPrimitives) {}

  static create(
    params: Pick<WorkflowDecisionResultPrimitives, 'id' | 'accountId' | 'opportunityId' | 'workflowStepId'>,
  ): WorkflowDecisionResult {
    const now = new Date();
    return new WorkflowDecisionResult({
      ...params,
      status: 'PENDING',
      evidence: null,
      evaluatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrimitives(data: WorkflowDecisionResultPrimitives): WorkflowDecisionResult {
    return new WorkflowDecisionResult(data);
  }

  requestEvaluation(): void {
    this.data.status = 'PENDING';
    this.data.evidence = null;
    this.data.evaluatedAt = null;
    this.data.updatedAt = new Date();
  }

  resolve(status: Exclude<WorkflowDecisionStatus, 'PENDING'>, evidence: string | null): void {
    const now = new Date();
    this.data.status = status;
    this.data.evidence = evidence;
    this.data.evaluatedAt = now;
    this.data.updatedAt = now;
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
