import { Migration } from '@mikro-orm/migrations';

export class Migration20260718_Sprint2Pipelines extends Migration {
  override up(): void {
    this.addSql(
      `create table "pipelines" (
        "id" uuid not null,
        "account_id" uuid not null,
        "name" varchar(255) not null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "pipelines_pkey" primary key ("id"),
        constraint "pipelines_account_id_fkey" foreign key ("account_id") references "accounts"("id") on delete cascade
      );`,
    );

    this.addSql(
      `create table "pipeline_statuses" (
        "id" uuid not null,
        "pipeline_id" uuid not null,
        "name" varchar(255) not null,
        "description" text null,
        "background_color" varchar(7) null,
        "text_color" varchar(7) null,
        "is_initial" boolean not null default false,
        "is_terminal" boolean not null default false,
        "outcome_type" varchar(10) not null default 'NONE',
        "show_in_kanban" boolean not null default true,
        "sort_points" integer not null default 100,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "pipeline_statuses_pkey" primary key ("id"),
        constraint "pipeline_statuses_pipeline_id_fkey" foreign key ("pipeline_id") references "pipelines"("id") on delete cascade
      );`,
    );
  }

  override down(): void {
    this.addSql(`drop table if exists "pipeline_statuses" cascade;`);
    this.addSql(`drop table if exists "pipelines" cascade;`);
  }
}
