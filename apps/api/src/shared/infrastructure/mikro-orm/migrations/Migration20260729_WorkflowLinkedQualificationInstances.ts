import { Migration } from '@mikro-orm/migrations';

export class Migration20260729_WorkflowLinkedQualificationInstances extends Migration {
  override up(): void {
    this.addSql(`
      insert into "control_questions" (
        "id", "account_id", "opportunity_id", "default_control_question_id",
        "question", "answer_type", "pass_condition_prompt"
      )
      select gen_random_uuid(), o."account_id", o."id", d."id",
        d."question", d."answer_type", d."pass_condition_prompt"
      from "opportunities" o
      join "workflow_steps" ws on ws."workflow_id" = o."workflow_id"
      join "default_workflow_step_actions" a on a."workflow_step_id" = ws."id"
        and a."target_type" = 'control_question'
      join "default_control_questions" d on d."id" = a."target_id"
      on conflict ("opportunity_id", "default_control_question_id") do nothing;
    `);
    this.addSql(`
      insert into "custom_fields" (
        "id", "account_id", "opportunity_id", "default_custom_field_id",
        "name", "description", "type", "classifiers", "can_select_multiple", "automatic", "ai_prompt"
      )
      select gen_random_uuid(), o."account_id", o."id", d."id",
        d."name", d."description", d."type", d."classifiers",
        d."can_select_multiple", d."automatic", d."ai_prompt"
      from "opportunities" o
      join "workflow_steps" ws on ws."workflow_id" = o."workflow_id"
      join "default_workflow_step_actions" a on a."workflow_step_id" = ws."id"
        and a."target_type" = 'custom_field'
      join "default_custom_fields" d on d."id" = a."target_id"
      on conflict ("opportunity_id", "default_custom_field_id") do nothing;
    `);
    this.addSql(`
      insert into "summaries" (
        "id", "account_id", "opportunity_id", "summary_template_id", "name", "prompt"
      )
      select gen_random_uuid(), o."account_id", o."id", t."id", t."name", t."prompt"
      from "opportunities" o
      join "workflow_steps" ws on ws."workflow_id" = o."workflow_id"
      join "default_workflow_step_actions" a on a."workflow_step_id" = ws."id"
        and a."target_type" = 'summary'
      join "summary_templates" t on t."id" = a."target_id"
      on conflict ("opportunity_id", "summary_template_id") do nothing;
    `);

    this.addSql(`
      update "workflow_step_actions" runtime
      set "target_id" = instance."id"
      from "default_workflow_step_actions" definition
      join "control_questions" instance
        on instance."default_control_question_id" = definition."target_id"
      where runtime."default_workflow_step_action_id" = definition."id"
        and runtime."opportunity_id" = instance."opportunity_id"
        and runtime."target_type" = 'control_question';
    `);
    this.addSql(`
      update "workflow_step_actions" runtime
      set "target_id" = instance."id"
      from "default_workflow_step_actions" definition
      join "custom_fields" instance
        on instance."default_custom_field_id" = definition."target_id"
      where runtime."default_workflow_step_action_id" = definition."id"
        and runtime."opportunity_id" = instance."opportunity_id"
        and runtime."target_type" = 'custom_field';
    `);
    this.addSql(`
      update "workflow_step_actions" runtime
      set "target_id" = instance."id"
      from "default_workflow_step_actions" definition
      join "summaries" instance
        on instance."summary_template_id" = definition."target_id"
      where runtime."default_workflow_step_action_id" = definition."id"
        and runtime."opportunity_id" = instance."opportunity_id"
        and runtime."target_type" = 'summary';
    `);

    this.addSql(`
      insert into "workflow_step_actions" (
        "id", "account_id", "opportunity_id", "workflow_step_id",
        "default_workflow_step_action_id", "name", "target_type", "target_id",
        "metadata", "position", "status", "error_message", "completed_at",
        "created_at", "updated_at"
      )
      select gen_random_uuid(), o."account_id", o."id", ws."id",
        definition."id", definition."name", definition."target_type",
        case definition."target_type"
          when 'control_question' then cq."id"
          when 'custom_field' then cf."id"
          when 'summary' then s."id"
          else definition."target_id"
        end,
        definition."metadata", definition."position", 'PENDING', null, null,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      from "opportunities" o
      join "workflow_steps" ws on ws."workflow_id" = o."workflow_id"
      join "default_workflow_step_actions" definition on definition."workflow_step_id" = ws."id"
      left join "control_questions" cq on cq."opportunity_id" = o."id"
        and cq."default_control_question_id" = definition."target_id"
        and definition."target_type" = 'control_question'
      left join "custom_fields" cf on cf."opportunity_id" = o."id"
        and cf."default_custom_field_id" = definition."target_id"
        and definition."target_type" = 'custom_field'
      left join "summaries" s on s."opportunity_id" = o."id"
        and s."summary_template_id" = definition."target_id"
        and definition."target_type" = 'summary'
      where not exists (
        select 1
        from "workflow_step_actions" runtime
        where runtime."opportunity_id" = o."id"
          and runtime."default_workflow_step_action_id" = definition."id"
      );
    `);

    this.addSql(`
      delete from "control_questions" instance
      using "opportunities" o
      where instance."opportunity_id" = o."id"
        and (
          o."workflow_id" is null
          or not exists (
            select 1
            from "workflow_steps" ws
            join "default_workflow_step_actions" a on a."workflow_step_id" = ws."id"
            where ws."workflow_id" = o."workflow_id"
              and a."target_type" = 'control_question'
              and a."target_id" = instance."default_control_question_id"
          )
        );
    `);
    this.addSql(`
      delete from "custom_fields" instance
      using "opportunities" o
      where instance."opportunity_id" = o."id"
        and (
          o."workflow_id" is null
          or not exists (
            select 1
            from "workflow_steps" ws
            join "default_workflow_step_actions" a on a."workflow_step_id" = ws."id"
            where ws."workflow_id" = o."workflow_id"
              and a."target_type" = 'custom_field'
              and a."target_id" = instance."default_custom_field_id"
          )
        );
    `);
    this.addSql(`
      delete from "summaries" instance
      using "opportunities" o
      where instance."opportunity_id" = o."id"
        and (
          o."workflow_id" is null
          or not exists (
            select 1
            from "workflow_steps" ws
            join "default_workflow_step_actions" a on a."workflow_step_id" = ws."id"
            where ws."workflow_id" = o."workflow_id"
              and a."target_type" = 'summary'
              and a."target_id" = instance."summary_template_id"
          )
        );
    `);
  }

  override down(): void {
    this.addSql(`
      update "workflow_step_actions" runtime
      set "target_id" = definition."target_id"
      from "default_workflow_step_actions" definition
      where runtime."default_workflow_step_action_id" = definition."id"
        and runtime."target_type" in ('control_question', 'custom_field', 'summary');
    `);
  }
}
