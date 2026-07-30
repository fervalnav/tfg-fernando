import type { ActionTargetType, WorkflowStepActionStatus } from '@tfg/types';

export type WorkflowStepActionPrimitives = {
  id: string;
  accountId: string;
  opportunityId: string;
  workflowStepId: string;
  defaultWorkflowStepActionId: string;
  name: string;
  targetType: ActionTargetType;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  position: number;
  status: WorkflowStepActionStatus;
  errorMessage: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class WorkflowStepAction {
  private constructor(private readonly data: WorkflowStepActionPrimitives) {}

  static create(
    params: Omit<WorkflowStepActionPrimitives, 'status' | 'errorMessage' | 'completedAt' | 'createdAt' | 'updatedAt'>,
  ): WorkflowStepAction {
    const now = new Date();
    return new WorkflowStepAction({
      ...params,
      status: 'PENDING',
      errorMessage: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrimitives(data: WorkflowStepActionPrimitives): WorkflowStepAction {
    return new WorkflowStepAction(data);
  }

  start(): void {
    if (this.isSettled) return;
    this.data.status = 'IN_PROGRESS';
    this.data.errorMessage = null;
    this.data.updatedAt = new Date();
  }

  complete(): void {
    if (this.isSettled) return;
    const now = new Date();
    this.data.status = 'COMPLETED';
    this.data.errorMessage = null;
    this.data.completedAt = now;
    this.data.updatedAt = now;
  }

  completeWithTarget(targetId: string): void {
    if (this.isSettled) return;
    this.data.targetId = targetId;
    this.complete();
  }

  skip(): void {
    if (this.isSettled) return;
    const now = new Date();
    this.data.status = 'SKIPPED';
    this.data.errorMessage = null;
    this.data.completedAt = now;
    this.data.updatedAt = now;
  }

  fail(message: string): void {
    if (this.isSettled) return;
    this.data.status = 'FAILED';
    this.data.errorMessage = message;
    this.data.updatedAt = new Date();
  }

  retry(): void {
    if (this.data.status !== 'FAILED') return;
    this.data.status = 'PENDING';
    this.data.errorMessage = null;
    this.data.updatedAt = new Date();
  }

  toPrimitives(): WorkflowStepActionPrimitives {
    return { ...this.data };
  }

  get id(): string {
    return this.data.id;
  }
  get opportunityId(): string {
    return this.data.opportunityId;
  }
  get workflowStepId(): string {
    return this.data.workflowStepId;
  }
  get targetType(): ActionTargetType {
    return this.data.targetType;
  }
  get targetId(): string | null {
    return this.data.targetId;
  }
  get metadata(): Record<string, unknown> | null {
    return this.data.metadata;
  }
  get status(): WorkflowStepActionStatus {
    return this.data.status;
  }
  get isSettled(): boolean {
    return this.data.status === 'COMPLETED' || this.data.status === 'SKIPPED';
  }
}
