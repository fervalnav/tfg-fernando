import { Migration } from '@mikro-orm/migrations';

export class Migration20260722064912 extends Migration {
  override up(): void {
    this.addSql(
      `create table "workflows" ("id" uuid not null, "account_id" uuid not null, "name" varchar(255) not null, "description" text null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "workflows_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "workflow_steps" ("id" uuid not null, "workflow_id" uuid not null, "name" varchar(255) not null, "type" varchar(20) not null, "condition" text null, "position" int not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "workflow_steps_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "default_workflow_step_actions" ("id" uuid not null, "workflow_step_id" uuid not null, "name" varchar(255) not null, "target_type" varchar(50) not null, "target_id" uuid null, "metadata" jsonb null, "position" int not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "default_workflow_step_actions_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "workflow_steps" add constraint "workflow_steps_workflow_id_foreign" foreign key ("workflow_id") references "workflows" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "default_workflow_step_actions" add constraint "default_workflow_step_actions_workflow_step_id_foreign" foreign key ("workflow_step_id") references "workflow_steps" ("id") on update cascade;`,
    );

    this.addSql(`alter table "default_control_questions" drop constraint "default_control_questions_account_id_fkey";`);

    this.addSql(`alter table "default_custom_fields" drop constraint "default_custom_fields_account_id_fkey";`);

    this.addSql(`alter table "pipelines" drop constraint "pipelines_account_id_fkey";`);

    this.addSql(`alter table "pipeline_statuses" drop constraint "pipeline_statuses_pipeline_id_fkey";`);

    this.addSql(`alter table "summary_templates" drop constraint "summary_templates_account_id_fkey";`);

    this.addSql(`alter table "default_control_questions" alter column "answer_type" drop default;`);
    this.addSql(
      `alter table "default_control_questions" alter column "answer_type" type varchar(10) using ("answer_type"::varchar(10));`,
    );

    this.addSql(`alter table "default_custom_fields" alter column "type" drop default;`);
    this.addSql(
      `alter table "default_custom_fields" alter column "type" type varchar(20) using ("type"::varchar(20));`,
    );
    this.addSql(`alter table "default_custom_fields" alter column "classifiers" drop default;`);
    this.addSql(
      `alter table "default_custom_fields" alter column "classifiers" type jsonb using ("classifiers"::jsonb);`,
    );
    this.addSql(`alter table "default_custom_fields" alter column "can_select_multiple" drop default;`);
    this.addSql(
      `alter table "default_custom_fields" alter column "can_select_multiple" type boolean using ("can_select_multiple"::boolean);`,
    );
    this.addSql(`alter table "default_custom_fields" alter column "automatic" drop default;`);
    this.addSql(
      `alter table "default_custom_fields" alter column "automatic" type boolean using ("automatic"::boolean);`,
    );

    this.addSql(`alter table "pipeline_statuses" alter column "is_initial" drop default;`);
    this.addSql(
      `alter table "pipeline_statuses" alter column "is_initial" type boolean using ("is_initial"::boolean);`,
    );
    this.addSql(`alter table "pipeline_statuses" alter column "is_terminal" drop default;`);
    this.addSql(
      `alter table "pipeline_statuses" alter column "is_terminal" type boolean using ("is_terminal"::boolean);`,
    );
    this.addSql(`alter table "pipeline_statuses" alter column "outcome_type" drop default;`);
    this.addSql(
      `alter table "pipeline_statuses" alter column "outcome_type" type varchar(10) using ("outcome_type"::varchar(10));`,
    );
    this.addSql(`alter table "pipeline_statuses" alter column "sort_points" drop default;`);
    this.addSql(`alter table "pipeline_statuses" alter column "sort_points" type int using ("sort_points"::int);`);
    this.addSql(
      `alter table "pipeline_statuses" add constraint "pipeline_statuses_pipeline_id_foreign" foreign key ("pipeline_id") references "pipelines" ("id") on update cascade;`,
    );
  }

  override down(): void {
    this.addSql(`alter table "workflow_steps" drop constraint "workflow_steps_workflow_id_foreign";`);

    this.addSql(
      `alter table "default_workflow_step_actions" drop constraint "default_workflow_step_actions_workflow_step_id_foreign";`,
    );

    this.addSql(`drop table if exists "workflows" cascade;`);

    this.addSql(`drop table if exists "workflow_steps" cascade;`);

    this.addSql(`drop table if exists "default_workflow_step_actions" cascade;`);

    this.addSql(`alter table "pipeline_statuses" drop constraint "pipeline_statuses_pipeline_id_foreign";`);

    this.addSql(
      `alter table "default_control_questions" alter column "answer_type" type varchar(10) using ("answer_type"::varchar(10));`,
    );
    this.addSql(`alter table "default_control_questions" alter column "answer_type" set default 'TEXT';`);
    this.addSql(
      `alter table "default_control_questions" add constraint "default_control_questions_account_id_fkey" foreign key ("account_id") references "accounts" ("id") on update no action on delete cascade;`,
    );

    this.addSql(
      `alter table "default_custom_fields" alter column "type" type varchar(20) using ("type"::varchar(20));`,
    );
    this.addSql(`alter table "default_custom_fields" alter column "type" set default 'TEXT';`);
    this.addSql(
      `alter table "default_custom_fields" alter column "classifiers" type jsonb using ("classifiers"::jsonb);`,
    );
    this.addSql(`alter table "default_custom_fields" alter column "classifiers" set default '[]';`);
    this.addSql(
      `alter table "default_custom_fields" alter column "can_select_multiple" type bool using ("can_select_multiple"::bool);`,
    );
    this.addSql(`alter table "default_custom_fields" alter column "can_select_multiple" set default false;`);
    this.addSql(`alter table "default_custom_fields" alter column "automatic" type bool using ("automatic"::bool);`);
    this.addSql(`alter table "default_custom_fields" alter column "automatic" set default false;`);
    this.addSql(
      `alter table "default_custom_fields" add constraint "default_custom_fields_account_id_fkey" foreign key ("account_id") references "accounts" ("id") on update no action on delete cascade;`,
    );

    this.addSql(`alter table "pipeline_statuses" alter column "is_initial" type bool using ("is_initial"::bool);`);
    this.addSql(`alter table "pipeline_statuses" alter column "is_initial" set default false;`);
    this.addSql(`alter table "pipeline_statuses" alter column "is_terminal" type bool using ("is_terminal"::bool);`);
    this.addSql(`alter table "pipeline_statuses" alter column "is_terminal" set default false;`);
    this.addSql(
      `alter table "pipeline_statuses" alter column "outcome_type" type varchar(10) using ("outcome_type"::varchar(10));`,
    );
    this.addSql(`alter table "pipeline_statuses" alter column "outcome_type" set default 'NONE';`);
    this.addSql(
      `alter table "pipeline_statuses" alter column "show_in_kanban" type bool using ("show_in_kanban"::bool);`,
    );
    this.addSql(`alter table "pipeline_statuses" alter column "show_in_kanban" set default true;`);
    this.addSql(`alter table "pipeline_statuses" alter column "sort_points" type int4 using ("sort_points"::int4);`);
    this.addSql(`alter table "pipeline_statuses" alter column "sort_points" set default 100;`);
    this.addSql(
      `alter table "pipeline_statuses" add constraint "pipeline_statuses_pipeline_id_fkey" foreign key ("pipeline_id") references "pipelines" ("id") on update no action on delete cascade;`,
    );

    this.addSql(
      `alter table "pipelines" add constraint "pipelines_account_id_fkey" foreign key ("account_id") references "accounts" ("id") on update no action on delete cascade;`,
    );

    this.addSql(
      `alter table "summary_templates" add constraint "summary_templates_account_id_fkey" foreign key ("account_id") references "accounts" ("id") on update no action on delete cascade;`,
    );
  }
}
