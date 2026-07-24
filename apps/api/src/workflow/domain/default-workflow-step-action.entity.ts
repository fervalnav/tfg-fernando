import type { ActionTargetType } from '@tfg/types';

type DefaultWorkflowStepActionPrimitives = {
  id: string;
  workflowStepId: string;
  name: string;
  targetType: ActionTargetType;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export class DefaultWorkflowStepAction {
  private constructor(
    private readonly _id: string,
    private readonly _workflowStepId: string,
    private _name: string,
    private _targetType: ActionTargetType,
    private _targetId: string | null,
    private _metadata: Record<string, unknown> | null,
    private _position: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    workflowStepId: string;
    name: string;
    targetType: ActionTargetType;
    targetId?: string;
    metadata?: Record<string, unknown>;
    position: number;
  }): DefaultWorkflowStepAction {
    const now = new Date();
    return new DefaultWorkflowStepAction(
      params.id,
      params.workflowStepId,
      params.name,
      params.targetType,
      params.targetId ?? null,
      params.metadata ?? null,
      params.position,
      now,
      now,
    );
  }

  static fromPrimitives(data: DefaultWorkflowStepActionPrimitives): DefaultWorkflowStepAction {
    return new DefaultWorkflowStepAction(
      data.id,
      data.workflowStepId,
      data.name,
      data.targetType,
      data.targetId,
      data.metadata,
      data.position,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(
    name: string,
    targetType: ActionTargetType,
    targetId: string | null,
    metadata: Record<string, unknown> | null,
    position: number,
  ): void {
    this._name = name;
    this._targetType = targetType;
    this._targetId = targetId;
    this._metadata = metadata;
    this._position = position;
    this._updatedAt = new Date();
  }

  toPrimitives(): DefaultWorkflowStepActionPrimitives {
    return {
      id: this._id,
      workflowStepId: this._workflowStepId,
      name: this._name,
      targetType: this._targetType,
      targetId: this._targetId,
      metadata: this._metadata,
      position: this._position,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id(): string {
    return this._id;
  }
  get workflowStepId(): string {
    return this._workflowStepId;
  }
  get name(): string {
    return this._name;
  }
  get targetType(): ActionTargetType {
    return this._targetType;
  }
  get targetId(): string | null {
    return this._targetId;
  }
  get metadata(): Record<string, unknown> | null {
    return this._metadata;
  }
  get position(): number {
    return this._position;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
