import { Migration } from '@mikro-orm/migrations';

export class Migration20260728_Sprint7QualificationInstances extends Migration {
  override up(): void {
    this.addSql(`
      create table "control_questions" (
        "id" uuid not null,
        "account_id" uuid not null,
        "opportunity_id" uuid not null,
        "default_control_question_id" uuid not null,
        "question" text not null,
        "answer_type" varchar(10) not null,
        "pass_condition_prompt" text null,
        "answer" jsonb null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "control_questions_pkey" primary key ("id"),
        constraint "control_questions_opportunity_fkey"
          foreign key ("opportunity_id") references "opportunities" ("id") on delete cascade,
        constraint "control_questions_unique_template"
          unique ("opportunity_id", "default_control_question_id")
      );
    `);
    this.addSql(`create index "control_questions_opportunity_idx" on "control_questions" ("opportunity_id");`);

    this.addSql(`
      create table "custom_fields" (
        "id" uuid not null,
        "account_id" uuid not null,
        "opportunity_id" uuid not null,
        "default_custom_field_id" uuid not null,
        "name" varchar(255) not null,
        "description" text null,
        "type" varchar(20) not null,
        "classifiers" jsonb not null default '[]',
        "can_select_multiple" boolean not null default false,
        "automatic" boolean not null default false,
        "ai_prompt" text null,
        "value" jsonb null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "custom_fields_pkey" primary key ("id"),
        constraint "custom_fields_opportunity_fkey"
          foreign key ("opportunity_id") references "opportunities" ("id") on delete cascade,
        constraint "custom_fields_unique_template"
          unique ("opportunity_id", "default_custom_field_id")
      );
    `);
    this.addSql(`create index "custom_fields_opportunity_idx" on "custom_fields" ("opportunity_id");`);

    this.addSql(`
      create table "summaries" (
        "id" uuid not null,
        "account_id" uuid not null,
        "opportunity_id" uuid not null,
        "summary_template_id" uuid not null,
        "name" varchar(255) not null,
        "prompt" text not null,
        "result" text null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "summaries_pkey" primary key ("id"),
        constraint "summaries_opportunity_fkey"
          foreign key ("opportunity_id") references "opportunities" ("id") on delete cascade,
        constraint "summaries_unique_template"
          unique ("opportunity_id", "summary_template_id")
      );
    `);
    this.addSql(`create index "summaries_opportunity_idx" on "summaries" ("opportunity_id");`);
  }

  override down(): void {
    this.addSql(`drop table if exists "summaries" cascade;`);
    this.addSql(`drop table if exists "custom_fields" cascade;`);
    this.addSql(`drop table if exists "control_questions" cascade;`);
  }
}
