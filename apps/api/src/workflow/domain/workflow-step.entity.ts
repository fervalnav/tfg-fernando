import type { StepType } from '@tfg/types';

type WorkflowStepPrimitives = {
  id: string;
  workflowId: string;
  name: string;
  type: StepType;
  condition: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export class WorkflowStep {
  private constructor(
    private readonly _id: string,
    private readonly _workflowId: string,
    private _name: string,
    private _type: StepType,
    private _condition: string | null,
    private _position: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    workflowId: string;
    name: string;
    type: StepType;
    condition?: string;
    position: number;
  }): WorkflowStep {
    const now = new Date();
    return new WorkflowStep(
      params.id,
      params.workflowId,
      params.name,
      params.type,
      params.condition ?? null,
      params.position,
      now,
      now,
    );
  }

  static fromPrimitives(data: WorkflowStepPrimitives): WorkflowStep {
    return new WorkflowStep(
      data.id,
      data.workflowId,
      data.name,
      data.type,
      data.condition,
      data.position,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(name: string, type: StepType, condition: string | null, position: number): void {
    this._name = name;
    this._type = type;
    this._condition = condition;
    this._position = position;
    this._updatedAt = new Date();
  }

  toPrimitives(): WorkflowStepPrimitives {
    return {
      id: this._id,
      workflowId: this._workflowId,
      name: this._name,
      type: this._type,
      condition: this._condition,
      position: this._position,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id(): string {
    return this._id;
  }
  get workflowId(): string {
    return this._workflowId;
  }
  get name(): string {
    return this._name;
  }
  get type(): StepType {
    return this._type;
  }
  get condition(): string | null {
    return this._condition;
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
