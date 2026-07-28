import { Migration } from '@mikro-orm/migrations';

export class Migration20260727_Sprint6PreserveActionHistory extends Migration {
  override up(): void {
    this.addSql(`
      alter table "workflow_step_actions"
        drop constraint if exists "workflow_step_actions_default_action_id_fkey";
    `);
  }

  override down(): void {
    this.addSql(`
      alter table "workflow_step_actions"
        add constraint "workflow_step_actions_default_action_id_fkey"
          foreign key ("default_workflow_step_action_id")
          references "default_workflow_step_actions" ("id")
          on delete cascade;
    `);
  }
}
