import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import {
  OpportunityRepository,
  type OpportunityFilters,
  type PipelineStatusTotal,
} from '../../domain/opportunity.repository';
import { Opportunity } from '../../domain/opportunity.entity';
import { OpportunityOrmEntity } from './opportunity.orm-entity';
import type { PaginatedResult } from '@/shared/domain/dto/paginated.dto';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class MikroOrmOpportunityRepository implements OpportunityRepository {
  constructor(private readonly em: EntityManager) {}

  async save(opportunity: Opportunity): Promise<void> {
    const p = opportunity.toPrimitives();
    const existing = await this.em.findOne(OpportunityOrmEntity, { id: p.id });
    if (existing) {
      wrap(existing).assign({
        title: p.title,
        description: p.description,
        amount: p.amount,
        currency: p.currency,
        pipelineId: p.pipelineId,
        pipelineStatusId: p.pipelineStatusId,
        sortPoints: p.sortPoints,
        workflowId: p.workflowId,
        workflowStepId: p.workflowStepId,
        organizationId: p.organizationId,
        dueDate: p.dueDate,
        finalOutcomeType: p.finalOutcomeType,
        closedAt: p.closedAt,
        responsibleUserIds: p.responsibleUserIds,
        responsibleTeamIds: p.responsibleTeamIds,
        updatedAt: p.updatedAt,
      });
      await this.em.flush();
      return;
    }
    await this.em.persistAndFlush(new OpportunityOrmEntity(p));
  }

  async findById(id: string, accountId: string): Promise<Opportunity | null> {
    const orm = await this.em.findOne(OpportunityOrmEntity, { id, accountId });
    return orm ? orm.toDomainEntity() : null;
  }

  async findAll(filters: OpportunityFilters, page: number, limit: number): Promise<PaginatedResult<Opportunity>> {
    const where: FilterQuery<OpportunityOrmEntity> = {
      accountId: filters.accountId,
      pipelineId: filters.pipelineId,
    };

    if (filters.q) where.title = { $ilike: `%${filters.q}%` };
    if (filters.statusIds?.length) where.pipelineStatusId = { $in: filters.statusIds };
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) (where.dueDate as Record<string, unknown>)['$gte'] = filters.dueDateFrom;
      if (filters.dueDateTo) (where.dueDate as Record<string, unknown>)['$lte'] = filters.dueDateTo;
    }
    if (filters.amountMin !== undefined && filters.amountMax !== undefined) {
      where.amount = { $gte: filters.amountMin, $lte: filters.amountMax };
    } else if (filters.amountMin !== undefined) {
      where.amount = { $gte: filters.amountMin };
    } else if (filters.amountMax !== undefined) {
      where.amount = { $lte: filters.amountMax };
    }

    const offset = (page - 1) * limit;
    const safeUserId = filters.userId && UUID_RE.test(filters.userId) ? filters.userId : undefined;
    const effectiveWhere = (
      safeUserId ? { ...where, $and: [{ $raw: `responsible_user_ids @> '["${safeUserId}"]'::jsonb` }] } : where
    ) as FilterQuery<OpportunityOrmEntity>;

    const [orms, total] = await this.em.findAndCount(OpportunityOrmEntity, effectiveWhere, {
      orderBy: { sortPoints: 'ASC', createdAt: 'ASC' },
      limit,
      offset,
    });

    return {
      items: orms.map((o) => o.toDomainEntity()),
      total,
      page,
      limit,
    };
  }

  async countInStatus(pipelineId: string, statusId: string): Promise<number> {
    return this.em.count(OpportunityOrmEntity, { pipelineId, pipelineStatusId: statusId });
  }

  async findKanban(filters: OpportunityFilters): Promise<Opportunity[]> {
    const knex = this.em.getKnex();
    const query = knex
      .select('o.*')
      .from('opportunities as o')
      .join('pipeline_statuses as ps', 'o.pipeline_status_id', 'ps.id')
      .where('o.pipeline_id', filters.pipelineId)
      .where('o.account_id', filters.accountId)
      .where('ps.show_in_kanban', true);

    if (filters.q) query.whereILike('o.title', `%${filters.q}%`);
    if (filters.statusIds?.length) query.whereIn('o.pipeline_status_id', filters.statusIds);
    if (filters.userId && UUID_RE.test(filters.userId)) {
      query.whereRaw('o.responsible_user_ids @> ?::jsonb', [JSON.stringify([filters.userId])]);
    }
    if (filters.dueDateFrom) query.where('o.due_date', '>=', filters.dueDateFrom);
    if (filters.dueDateTo) query.where('o.due_date', '<=', filters.dueDateTo);
    if (filters.amountMin !== undefined) query.where('o.amount', '>=', filters.amountMin);
    if (filters.amountMax !== undefined) query.where('o.amount', '<=', filters.amountMax);

    const rows = await query.orderBy('o.sort_points', 'asc');

    return rows.map((row: Record<string, unknown>) =>
      Opportunity.fromPrimitives({
        id: row['id'] as string,
        accountId: row['account_id'] as string,
        title: row['title'] as string,
        description: (row['description'] as string | null) ?? null,
        amount: row['amount'] != null ? Number(row['amount']) : null,
        currency: (row['currency'] as string | null) ?? null,
        pipelineId: row['pipeline_id'] as string,
        pipelineStatusId: row['pipeline_status_id'] as string,
        sortPoints: Number(row['sort_points']),
        workflowId: (row['workflow_id'] as string | null) ?? null,
        workflowStepId: (row['workflow_step_id'] as string | null) ?? null,
        organizationId: (row['organization_id'] as string | null) ?? null,
        dueDate: row['due_date'] ? new Date(row['due_date'] as string) : null,
        finalOutcomeType: (row['final_outcome_type'] as 'WON' | 'LOST' | 'DROPPED' | null) ?? null,
        closedAt: row['closed_at'] ? new Date(row['closed_at'] as string) : null,
        responsibleUserIds: (row['responsible_user_ids'] as string[]) ?? [],
        responsibleTeamIds: (row['responsible_team_ids'] as string[]) ?? [],
        createdAt: new Date(row['created_at'] as string),
        updatedAt: new Date(row['updated_at'] as string),
      }),
    );
  }

  async findStatusTotals(filters: OpportunityFilters): Promise<PipelineStatusTotal[]> {
    const knex = this.em.getKnex();
    const query = knex
      .select('pipeline_status_id as statusId')
      .count('* as count')
      .sum('amount as totalAmount')
      .from('opportunities')
      .where({ pipeline_id: filters.pipelineId, account_id: filters.accountId });

    if (filters.q) query.whereILike('title', `%${filters.q}%`);
    if (filters.statusIds?.length) query.whereIn('pipeline_status_id', filters.statusIds);
    if (filters.userId && UUID_RE.test(filters.userId)) {
      query.whereRaw('responsible_user_ids @> ?::jsonb', [JSON.stringify([filters.userId])]);
    }
    if (filters.dueDateFrom) query.where('due_date', '>=', filters.dueDateFrom);
    if (filters.dueDateTo) query.where('due_date', '<=', filters.dueDateTo);
    if (filters.amountMin !== undefined) query.where('amount', '>=', filters.amountMin);
    if (filters.amountMax !== undefined) query.where('amount', '<=', filters.amountMax);

    const rows = await query.groupBy('pipeline_status_id');

    return rows.map((row: Record<string, unknown>) => ({
      statusId: row['statusId'] as string,
      count: Number(row['count']),
      totalAmount: Number(row['totalAmount'] ?? 0),
    }));
  }

  async delete(id: string, accountId: string): Promise<void> {
    const orm = await this.em.findOne(OpportunityOrmEntity, { id, accountId });
    if (orm) await this.em.removeAndFlush(orm);
  }
}
