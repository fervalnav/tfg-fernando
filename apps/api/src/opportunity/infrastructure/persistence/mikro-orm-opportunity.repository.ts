import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import {
  OpportunityRepository,
  type OpportunityFilters,
  type PipelineStatusTotal,
} from '../../domain/opportunity.repository';
import { Opportunity } from '../../domain/opportunity.entity';
import { OpportunityOrmEntity } from './opportunity.orm-entity';
import type { PaginatedResult } from '@/shared/domain/dto/paginated.dto';

type SqlQuery = ReturnType<ReturnType<EntityManager['getKnex']>['from']>;

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
    const offset = (page - 1) * limit;
    const knex = this.em.getKnex();
    const base = knex
      .from('opportunities as o')
      .where('o.account_id', filters.accountId)
      .where('o.pipeline_id', filters.pipelineId);
    this.applyFilters(base, filters, 'o');
    const rows = await base
      .clone()
      .select('o.*')
      .orderBy('o.sort_points', 'asc')
      .orderBy('o.created_at', 'asc')
      .limit(limit)
      .offset(offset);
    const countRow = (await base.clone().clearSelect().clearOrder().count('* as total').first()) as
      | { total: string | number }
      | undefined;

    return {
      items: rows.map((row: Record<string, unknown>) => this.toDomain(row)),
      total: Number(countRow?.total ?? 0),
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
      .from('opportunities as o')
      .join('pipeline_statuses as ps', 'o.pipeline_status_id', 'ps.id')
      .where('o.pipeline_id', filters.pipelineId)
      .where('o.account_id', filters.accountId)
      .where('ps.show_in_kanban', true);

    // Knex widens the record type after joins although the fluent builder API remains compatible here.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.applyFilters(query, filters, 'o');

    const rows = await query.select('o.*').orderBy('o.sort_points', 'asc');

    return rows.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  private toDomain(row: Record<string, unknown>): Opportunity {
    return Opportunity.fromPrimitives({
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
    });
  }

  async findStatusTotals(filters: OpportunityFilters): Promise<PipelineStatusTotal[]> {
    const knex = this.em.getKnex();
    const query = knex
      .select('pipeline_status_id as statusId')
      .count('* as count')
      .sum('amount as totalAmount')
      .from('opportunities')
      .where({ pipeline_id: filters.pipelineId, account_id: filters.accountId });

    this.applyFilters(query, filters, 'opportunities');

    const rows = await query.groupBy('pipeline_status_id');

    return rows.map((row: Record<string, unknown>) => ({
      statusId: row['statusId'] as string,
      count: Number(row['count']),
      totalAmount: Number(row['totalAmount'] ?? 0),
    }));
  }

  private applyFilters(query: SqlQuery, filters: OpportunityFilters, alias: string): void {
    const column = (name: string) => `${alias}.${name}`;
    if (filters.q) query.whereILike(column('title'), `%${filters.q}%`);
    if (filters.statusIds?.length) query.whereIn(column('pipeline_status_id'), filters.statusIds);
    if (filters.userId && UUID_RE.test(filters.userId))
      query.whereRaw(`${column('responsible_user_ids')} @> ?::jsonb`, [JSON.stringify([filters.userId])]);
    if (filters.dueDateFrom) query.where(column('due_date'), '>=', filters.dueDateFrom);
    if (filters.dueDateTo) query.where(column('due_date'), '<=', filters.dueDateTo);
    if (filters.amountMin !== undefined) query.where(column('amount'), '>=', filters.amountMin);
    if (filters.amountMax !== undefined) query.where(column('amount'), '<=', filters.amountMax);
    filters.customFields?.forEach((filter) => {
      const scalar = "cf.value #>> '{}'";
      const classifierValue = JSON.stringify(filter.value);
      const comparisons: Record<string, [string, (string | number | boolean)[]]> = {
        CONTAINS: [
          filter.type === 'CLASSIFIER' ? 'cf.value::jsonb @> ?::jsonb' : `${scalar} ILIKE ?`,
          [filter.type === 'CLASSIFIER' ? classifierValue : `%${filter.value}%`],
        ],
        EQUALS: [
          filter.type === 'CLASSIFIER' ? 'cf.value::jsonb @> ?::jsonb' : `${scalar} = ?`,
          [filter.type === 'CLASSIFIER' ? classifierValue : String(filter.value)],
        ],
        NOT_EQUALS: [
          filter.type === 'CLASSIFIER' ? 'NOT (cf.value::jsonb @> ?::jsonb)' : `${scalar} <> ?`,
          [filter.type === 'CLASSIFIER' ? classifierValue : String(filter.value)],
        ],
        GREATER_THAN: [`(${scalar})::numeric > ?`, [filter.value]],
        GREATER_THAN_OR_EQUAL: [`(${scalar})::numeric >= ?`, [filter.value]],
        LESS_THAN: [`(${scalar})::numeric < ?`, [filter.value]],
        LESS_THAN_OR_EQUAL: [`(${scalar})::numeric <= ?`, [filter.value]],
        BEFORE: [`(${scalar})::date < ?::date`, [filter.value]],
        AFTER: [`(${scalar})::date > ?::date`, [filter.value]],
      };
      const [comparison, values] = comparisons[filter.operator]!;
      query.whereExists(function (this: SqlQuery) {
        this.select('*')
          .from('custom_fields as cf')
          .whereRaw(`cf.opportunity_id = ${column('id')}`)
          .where('cf.account_id', filters.accountId)
          .where('cf.default_custom_field_id', filter.fieldId)
          .where('cf.type', filter.type)
          .whereNotNull('cf.value')
          .whereRaw(comparison, values);
      });
    });
  }

  async delete(id: string, accountId: string): Promise<void> {
    const orm = await this.em.findOne(OpportunityOrmEntity, { id, accountId });
    if (orm) await this.em.removeAndFlush(orm);
  }
}
