import { Migration } from '@mikro-orm/migrations';

export class Migration20260727_Sprint6OpportunityWorkflow extends Migration {
  override up(): void {
    this.addSql(`
      alter table "opportunities"
        add constraint "opportunities_workflow_id_fkey"
          foreign key ("workflow_id") references "workflows" ("id") on delete set null,
        add constraint "opportunities_workflow_step_id_fkey"
          foreign key ("workflow_step_id") references "workflow_steps" ("id") on delete set null;
    `);

    this.addSql(`
      create table "workflow_step_actions" (
        "id" uuid not null,
        "account_id" uuid not null,
        "opportunity_id" uuid not null,
        "workflow_step_id" uuid not null,
        "default_workflow_step_action_id" uuid not null,
        "name" varchar(255) not null,
        "target_type" varchar(50) not null,
        "target_id" uuid null,
        "metadata" jsonb null,
        "position" integer not null,
        "status" varchar(20) not null default 'PENDING',
        "error_message" text null,
        "completed_at" timestamptz null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "workflow_step_actions_pkey" primary key ("id"),
        constraint "workflow_step_actions_opportunity_id_fkey"
          foreign key ("opportunity_id") references "opportunities" ("id") on delete cascade,
        constraint "workflow_step_actions_workflow_step_id_fkey"
          foreign key ("workflow_step_id") references "workflow_steps" ("id") on delete cascade,
        constraint "workflow_step_actions_unique_instance"
          unique ("opportunity_id", "default_workflow_step_action_id")
      );
    `);
    this.addSql(`create index "workflow_step_actions_opportunity_idx" on "workflow_step_actions" ("opportunity_id");`);
    this.addSql(`create index "workflow_step_actions_step_idx" on "workflow_step_actions" ("workflow_step_id");`);
    this.addSql(`create index "workflow_step_actions_status_idx" on "workflow_step_actions" ("status");`);

    this.addSql(`
      create table "workflow_decision_results" (
        "id" uuid not null,
        "account_id" uuid not null,
        "opportunity_id" uuid not null,
        "workflow_step_id" uuid not null,
        "status" varchar(20) not null default 'PENDING',
        "evidence" text null,
        "evaluated_at" timestamptz null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "workflow_decision_results_pkey" primary key ("id"),
        constraint "workflow_decision_results_opportunity_id_fkey"
          foreign key ("opportunity_id") references "opportunities" ("id") on delete cascade,
        constraint "workflow_decision_results_workflow_step_id_fkey"
          foreign key ("workflow_step_id") references "workflow_steps" ("id") on delete cascade,
        constraint "workflow_decision_results_unique_step"
          unique ("opportunity_id", "workflow_step_id")
      );
    `);
    this.addSql(
      `create index "workflow_decision_results_opportunity_idx" on "workflow_decision_results" ("opportunity_id");`,
    );
  }

  override down(): void {
    this.addSql(`drop table if exists "workflow_decision_results" cascade;`);
    this.addSql(`drop table if exists "workflow_step_actions" cascade;`);
    this.addSql(`alter table "opportunities" drop constraint if exists "opportunities_workflow_step_id_fkey";`);
    this.addSql(`alter table "opportunities" drop constraint if exists "opportunities_workflow_id_fkey";`);
  }
}
