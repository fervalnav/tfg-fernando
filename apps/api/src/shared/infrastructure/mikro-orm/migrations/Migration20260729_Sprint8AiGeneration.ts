import { Migration } from '@mikro-orm/migrations';

export class Migration20260729_Sprint8AiGeneration extends Migration {
  override up(): void {
    this.addSql(
      'alter table "summaries" add column "generation_status" varchar(20) not null default \'IDLE\', add column "generation_error" text null, add column "generated_at" timestamptz null;',
    );
    this.addSql(
      'alter table "control_questions" add column "ai_status" varchar(20) not null default \'IDLE\', add column "ai_error" text null, add column "ai_evidence" text null, add column "ai_passed" boolean null, add column "ai_generated_at" timestamptz null;',
    );
    this.addSql(
      'alter table "custom_fields" add column "ai_status" varchar(20) not null default \'IDLE\', add column "ai_error" text null, add column "ai_evidence" text null, add column "ai_generated_at" timestamptz null;',
    );
  }

  override down(): void {
    this.addSql(
      'alter table "summaries" drop column "generation_status", drop column "generation_error", drop column "generated_at";',
    );
    this.addSql(
      'alter table "control_questions" drop column "ai_status", drop column "ai_error", drop column "ai_evidence", drop column "ai_passed", drop column "ai_generated_at";',
    );
    this.addSql(
      'alter table "custom_fields" drop column "ai_status", drop column "ai_error", drop column "ai_evidence", drop column "ai_generated_at";',
    );
  }
}
