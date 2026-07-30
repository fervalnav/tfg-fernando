import { Migration } from '@mikro-orm/migrations';

export class Migration20260729184048 extends Migration {
  override up(): void {
    this.addSql(`
      create table "attachments" (
        "id" uuid not null,
        "account_id" uuid not null,
        "opportunity_id" uuid not null,
        "workflow_step_action_id" uuid null,
        "name" varchar(255) not null,
        "description" text null,
        "mime_type" varchar(150) not null,
        "size" int not null,
        "file_key" varchar(1024) not null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "attachments_pkey" primary key ("id"),
        constraint "attachments_file_key_unique" unique ("file_key"),
        constraint "attachments_opportunity_id_fkey"
          foreign key ("opportunity_id") references "opportunities" ("id") on delete cascade,
        constraint "attachments_workflow_step_action_id_fkey"
          foreign key ("workflow_step_action_id") references "workflow_step_actions" ("id") on delete set null
      );
    `);
    this.addSql(`create index "attachments_opportunity_idx" on "attachments" ("account_id", "opportunity_id");`);
    this.addSql(`create index "attachments_workflow_action_idx" on "attachments" ("workflow_step_action_id");`);
  }

  override down(): void {
    this.addSql(`drop table if exists "attachments" cascade;`);
  }
}
