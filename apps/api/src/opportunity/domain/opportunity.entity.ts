import { AggregateRoot } from '@/shared/domain/aggregate-root';
import type { FinalOutcomeType } from './value-objects/final-outcome-type.vo';
import {
  OpportunityCreatedEvent,
  OpportunityStepActionsCreatedEvent,
  OpportunityWorkflowCompletedEvent,
  OpportunityWorkflowStepEnteredEvent,
} from './events/opportunity-workflow.events';

type OpportunityPrimitives = {
  id: string;
  accountId: string;
  title: string;
  description: string | null;
  amount: number | null;
  currency: string | null;
  pipelineId: string;
  pipelineStatusId: string;
  sortPoints: number;
  workflowId: string | null;
  workflowStepId: string | null;
  organizationId: string | null;
  dueDate: Date | null;
  finalOutcomeType: FinalOutcomeType | null;
  closedAt: Date | null;
  responsibleUserIds: string[];
  responsibleTeamIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export class Opportunity extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private _title: string,
    private _description: string | null,
    private _amount: number | null,
    private _currency: string | null,
    private _pipelineId: string,
    private _pipelineStatusId: string,
    private _sortPoints: number,
    private _workflowId: string | null,
    private _workflowStepId: string | null,
    private _organizationId: string | null,
    private _dueDate: Date | null,
    private _finalOutcomeType: FinalOutcomeType | null,
    private _closedAt: Date | null,
    private _responsibleUserIds: string[],
    private _responsibleTeamIds: string[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(params: {
    id: string;
    accountId: string;
    title: string;
    description?: string | null;
    amount?: number | null;
    currency?: string | null;
    pipelineId: string;
    pipelineStatusId: string;
    sortPoints: number;
    workflowId?: string | null;
    workflowIdToAssign?: string | null;
    dueDate?: Date | null;
  }): Opportunity {
    const now = new Date();
    const opportunity = new Opportunity(
      params.id,
      params.accountId,
      params.title,
      params.description ?? null,
      params.amount ?? null,
      params.currency ?? 'EUR',
      params.pipelineId,
      params.pipelineStatusId,
      params.sortPoints,
      params.workflowId ?? null,
      null,
      null,
      params.dueDate ?? null,
      null,
      null,
      [],
      [],
      now,
      now,
    );
    opportunity.record(
      new OpportunityCreatedEvent(params.id, params.accountId, params.workflowIdToAssign ?? params.workflowId ?? null),
    );
    return opportunity;
  }

  static fromPrimitives(data: OpportunityPrimitives): Opportunity {
    return new Opportunity(
      data.id,
      data.accountId,
      data.title,
      data.description,
      data.amount,
      data.currency,
      data.pipelineId,
      data.pipelineStatusId,
      data.sortPoints,
      data.workflowId,
      data.workflowStepId,
      data.organizationId,
      data.dueDate,
      data.finalOutcomeType,
      data.closedAt,
      data.responsibleUserIds,
      data.responsibleTeamIds,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(params: {
    title?: string;
    description?: string | null;
    amount?: number | null;
    currency?: string | null;
    dueDate?: Date | null;
    responsibleUserIds?: string[];
    responsibleTeamIds?: string[];
  }): void {
    if (params.title !== undefined) this._title = params.title;
    if (params.description !== undefined) this._description = params.description;
    if (params.amount !== undefined) this._amount = params.amount;
    if (params.currency !== undefined) this._currency = params.currency;
    if (params.dueDate !== undefined) this._dueDate = params.dueDate;
    if (params.responsibleUserIds !== undefined) this._responsibleUserIds = [...params.responsibleUserIds];
    if (params.responsibleTeamIds !== undefined) this._responsibleTeamIds = [...params.responsibleTeamIds];
    this._updatedAt = new Date();
  }

  transitionStatus(pipelineStatusId: string, finalOutcomeType: FinalOutcomeType | null, sortPoints?: number): void {
    this._pipelineStatusId = pipelineStatusId;
    this._finalOutcomeType = finalOutcomeType;
    this._closedAt = finalOutcomeType !== null ? new Date() : null;
    if (sortPoints !== undefined) this._sortPoints = sortPoints;
    this._updatedAt = new Date();
  }

  updatePosition(sortPoints: number, pipelineStatusId?: string): void {
    this._sortPoints = sortPoints;
    if (pipelineStatusId !== undefined) this._pipelineStatusId = pipelineStatusId;
    this._updatedAt = new Date();
  }

  assignWorkflow(workflowId: string, workflowStepId: string): void {
    this._workflowId = workflowId;
    this._workflowStepId = workflowStepId;
    this._updatedAt = new Date();
    this.record(new OpportunityWorkflowStepEnteredEvent(this._id, this._accountId, workflowStepId));
  }

  advanceWorkflowStep(workflowStepId: string): void {
    this._workflowStepId = workflowStepId;
    this._updatedAt = new Date();
    this.record(new OpportunityWorkflowStepEnteredEvent(this._id, this._accountId, workflowStepId));
  }

  notifyStepActionsCreated(): void {
    this.record(new OpportunityStepActionsCreatedEvent(this._id, this._accountId));
  }

  completeWorkflow(): void {
    this.record(new OpportunityWorkflowCompletedEvent(this._id, this._accountId));
  }

  transitionPipelineStatus(pipelineId: string, pipelineStatusId: string): void {
    this._pipelineId = pipelineId;
    this._pipelineStatusId = pipelineStatusId;
    this._updatedAt = new Date();
  }

  toPrimitives(): OpportunityPrimitives {
    return {
      id: this._id,
      accountId: this._accountId,
      title: this._title,
      description: this._description,
      amount: this._amount,
      currency: this._currency,
      pipelineId: this._pipelineId,
      pipelineStatusId: this._pipelineStatusId,
      sortPoints: this._sortPoints,
      workflowId: this._workflowId,
      workflowStepId: this._workflowStepId,
      organizationId: this._organizationId,
      dueDate: this._dueDate,
      finalOutcomeType: this._finalOutcomeType,
      closedAt: this._closedAt,
      responsibleUserIds: this._responsibleUserIds,
      responsibleTeamIds: this._responsibleTeamIds,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id(): string {
    return this._id;
  }
  get accountId(): string {
    return this._accountId;
  }
  get title(): string {
    return this._title;
  }
  get description(): string | null {
    return this._description;
  }
  get amount(): number | null {
    return this._amount;
  }
  get currency(): string | null {
    return this._currency;
  }
  get pipelineId(): string {
    return this._pipelineId;
  }
  get pipelineStatusId(): string {
    return this._pipelineStatusId;
  }
  get sortPoints(): number {
    return this._sortPoints;
  }
  get workflowId(): string | null {
    return this._workflowId;
  }
  get workflowStepId(): string | null {
    return this._workflowStepId;
  }
  get organizationId(): string | null {
    return this._organizationId;
  }
  get dueDate(): Date | null {
    return this._dueDate;
  }
  get finalOutcomeType(): FinalOutcomeType | null {
    return this._finalOutcomeType;
  }
  get closedAt(): Date | null {
    return this._closedAt;
  }
  get responsibleUserIds(): string[] {
    return this._responsibleUserIds;
  }
  get responsibleTeamIds(): string[] {
    return this._responsibleTeamIds;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
