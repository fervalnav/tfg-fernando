import { Migration } from '@mikro-orm/migrations';

export class Migration20260726_Sprint5Opportunities extends Migration {
  override up(): void {
    this.addSql(
      `create table "opportunities" (
        "id" uuid not null,
        "account_id" uuid not null,
        "title" text not null,
        "description" text null,
        "amount" double precision null,
        "currency" varchar(3) null default 'EUR',
        "pipeline_id" uuid not null,
        "pipeline_status_id" uuid not null,
        "sort_points" double precision not null default 0,
        "workflow_id" uuid null,
        "workflow_step_id" uuid null,
        "organization_id" uuid null,
        "due_date" date null,
        "final_outcome_type" varchar(10) null,
        "closed_at" timestamptz null,
        "responsible_user_ids" jsonb not null default '[]',
        "responsible_team_ids" jsonb not null default '[]',
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "opportunities_pkey" primary key ("id"),
        constraint "opportunities_pipeline_id_fkey" foreign key ("pipeline_id") references "pipelines"("id") on delete cascade,
        constraint "opportunities_pipeline_status_id_fkey" foreign key ("pipeline_status_id") references "pipeline_statuses"("id") on delete cascade
      );`,
    );

    this.addSql(`create index "opportunities_account_id_idx" on "opportunities" ("account_id");`);
    this.addSql(`create index "opportunities_pipeline_id_idx" on "opportunities" ("pipeline_id");`);
    this.addSql(`create index "opportunities_pipeline_status_id_idx" on "opportunities" ("pipeline_status_id");`);
    this.addSql(`create index "opportunities_sort_points_idx" on "opportunities" ("sort_points");`);
  }

  override down(): void {
    this.addSql(`drop table if exists "opportunities" cascade;`);
  }
}
