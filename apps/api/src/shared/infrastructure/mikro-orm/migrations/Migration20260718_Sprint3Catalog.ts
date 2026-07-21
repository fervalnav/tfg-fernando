import { Migration } from '@mikro-orm/migrations';

export class Migration20260718_Sprint3Catalog extends Migration {
  override up(): void {
    this.addSql(`
      create table "default_control_questions" (
        "id" uuid not null,
        "account_id" uuid not null,
        "question" text not null,
        "answer_type" varchar(10) not null default 'TEXT',
        "pass_condition_prompt" text null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "default_control_questions_pkey" primary key ("id"),
        constraint "default_control_questions_account_id_fkey" foreign key ("account_id") references "accounts"("id") on delete cascade
      );
    `);

    this.addSql(`
      create table "default_custom_fields" (
        "id" uuid not null,
        "account_id" uuid not null,
        "name" varchar(255) not null,
        "description" text null,
        "type" varchar(20) not null default 'TEXT',
        "classifiers" jsonb not null default '[]',
        "can_select_multiple" boolean not null default false,
        "automatic" boolean not null default false,
        "ai_prompt" text null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "default_custom_fields_pkey" primary key ("id"),
        constraint "default_custom_fields_account_id_fkey" foreign key ("account_id") references "accounts"("id") on delete cascade
      );
    `);

    this.addSql(`
      create table "summary_templates" (
        "id" uuid not null,
        "account_id" uuid not null,
        "name" varchar(255) not null,
        "prompt" text not null,
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        constraint "summary_templates_pkey" primary key ("id"),
        constraint "summary_templates_account_id_fkey" foreign key ("account_id") references "accounts"("id") on delete cascade
      );
    `);
  }

  override down(): void {
    this.addSql(`drop table if exists "default_control_questions" cascade;`);
    this.addSql(`drop table if exists "default_custom_fields" cascade;`);
    this.addSql(`drop table if exists "summary_templates" cascade;`);
  }
}
