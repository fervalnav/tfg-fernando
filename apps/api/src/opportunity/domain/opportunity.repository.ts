import type { Opportunity } from './opportunity.entity';
import type { PaginatedResult } from '@/shared/domain/dto/paginated.dto';

export type OpportunityFilters = {
  pipelineId: string;
  accountId: string;
  q?: string;
  statusIds?: string[];
  userId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  amountMin?: number;
  amountMax?: number;
};

export type PipelineStatusTotal = {
  statusId: string;
  count: number;
  totalAmount: number;
};

export abstract class OpportunityRepository {
  abstract save(opportunity: Opportunity): Promise<void>;
  abstract findById(id: string, accountId: string): Promise<Opportunity | null>;
  abstract findAll(filters: OpportunityFilters, page: number, limit: number): Promise<PaginatedResult<Opportunity>>;
  abstract countInStatus(pipelineId: string, statusId: string): Promise<number>;
  abstract findKanban(pipelineId: string, accountId: string): Promise<Opportunity[]>;
  abstract findStatusTotals(pipelineId: string, accountId: string): Promise<PipelineStatusTotal[]>;
  abstract delete(id: string, accountId: string): Promise<void>;
}
