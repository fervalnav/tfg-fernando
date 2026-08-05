import type { OutcomeType } from './value-objects/outcome-type.vo';
import { InvalidPipelineStatusException } from './exceptions/invalid-pipeline-status.exception';

type PipelineStatusPrimitives = {
  id: string;
  pipelineId: string;
  name: string;
  description: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  isInitial: boolean;
  isTerminal: boolean;
  outcomeType: OutcomeType;
  showInKanban: boolean;
  sortPoints: number;
  createdAt: Date;
  updatedAt: Date;
};

export class PipelineStatus {
  private constructor(
    private readonly _id: string,
    private readonly _pipelineId: string,
    private _name: string,
    private _description: string | null,
    private _backgroundColor: string | null,
    private _textColor: string | null,
    private _isInitial: boolean,
    private _isTerminal: boolean,
    private _outcomeType: OutcomeType,
    private _showInKanban: boolean,
    private _sortPoints: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  private static validate(isInitial: boolean, isTerminal: boolean, outcomeType: OutcomeType): void {
    if (isInitial && isTerminal)
      throw new InvalidPipelineStatusException('A status cannot be both initial and terminal');
    if (!isTerminal && outcomeType !== 'NONE')
      throw new InvalidPipelineStatusException('Non-terminal status must have outcomeType NONE');
    if (isTerminal && outcomeType === 'NONE')
      throw new InvalidPipelineStatusException('Terminal status must have a non-NONE outcomeType');
  }

  static create(params: {
    id: string;
    pipelineId: string;
    name: string;
    description?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    isInitial?: boolean;
    isTerminal?: boolean;
    outcomeType?: OutcomeType;
    showInKanban?: boolean;
    sortPoints: number;
  }): PipelineStatus {
    const isInitial = params.isInitial ?? false;
    const isTerminal = params.isTerminal ?? false;
    const outcomeType = params.outcomeType ?? 'NONE';
    PipelineStatus.validate(isInitial, isTerminal, outcomeType);
    const now = new Date();
    return new PipelineStatus(
      params.id,
      params.pipelineId,
      params.name,
      params.description ?? null,
      params.backgroundColor ?? null,
      params.textColor ?? null,
      isInitial,
      isTerminal,
      outcomeType,
      params.showInKanban ?? true,
      params.sortPoints,
      now,
      now,
    );
  }

  static fromPrimitives(data: PipelineStatusPrimitives): PipelineStatus {
    return new PipelineStatus(
      data.id,
      data.pipelineId,
      data.name,
      data.description,
      data.backgroundColor,
      data.textColor,
      data.isInitial,
      data.isTerminal,
      data.outcomeType,
      data.showInKanban,
      data.sortPoints,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(params: {
    name?: string;
    description?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    isTerminal?: boolean;
    outcomeType?: OutcomeType;
    showInKanban?: boolean;
  }): void {
    const isTerminal = params.isTerminal ?? this._isTerminal;
    const outcomeType = params.outcomeType ?? this._outcomeType;
    PipelineStatus.validate(this._isInitial, isTerminal, outcomeType);

    if (params.name !== undefined) this._name = params.name;
    if (params.description !== undefined) this._description = params.description;
    if (params.backgroundColor !== undefined) this._backgroundColor = params.backgroundColor;
    if (params.textColor !== undefined) this._textColor = params.textColor;
    this._isTerminal = isTerminal;
    this._outcomeType = outcomeType;
    if (params.showInKanban !== undefined) this._showInKanban = params.showInKanban;
    this._updatedAt = new Date();
  }

  setInitial(value: boolean): void {
    if (value && this._isTerminal)
      throw new InvalidPipelineStatusException('A terminal status cannot be set as initial');
    this._isInitial = value;
    this._updatedAt = new Date();
  }

  setSortPoints(sortPoints: number): void {
    this._sortPoints = sortPoints;
    this._updatedAt = new Date();
  }

  toPrimitives(): PipelineStatusPrimitives {
    return {
      id: this._id,
      pipelineId: this._pipelineId,
      name: this._name,
      description: this._description,
      backgroundColor: this._backgroundColor,
      textColor: this._textColor,
      isInitial: this._isInitial,
      isTerminal: this._isTerminal,
      outcomeType: this._outcomeType,
      showInKanban: this._showInKanban,
      sortPoints: this._sortPoints,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id(): string {
    return this._id;
  }
  get pipelineId(): string {
    return this._pipelineId;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get backgroundColor(): string | null {
    return this._backgroundColor;
  }
  get textColor(): string | null {
    return this._textColor;
  }
  get isInitial(): boolean {
    return this._isInitial;
  }
  get isTerminal(): boolean {
    return this._isTerminal;
  }
  get outcomeType(): OutcomeType {
    return this._outcomeType;
  }
  get showInKanban(): boolean {
    return this._showInKanban;
  }
  get sortPoints(): number {
    return this._sortPoints;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
