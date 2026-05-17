import { Migration } from '@mikro-orm/migrations';

export class Migration20260517110425_Sprint1Auth extends Migration {
  override up(): void {
    this.addSql(
      `create table "account_members" ("id" uuid not null, "account_id" uuid not null, "user_id" uuid not null, "role" varchar(20) not null, "is_default" boolean not null default false, "created_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "account_members_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "accounts" ("id" uuid not null, "name" varchar(255) not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "accounts_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "invitation_tokens" ("id" uuid not null, "account_id" uuid not null, "email" varchar(255) not null, "role" varchar(20) not null, "token_hash" varchar(255) not null, "expires_at" timestamptz not null, "used_at" timestamptz null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "invitation_tokens_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "refresh_tokens" ("id" uuid not null, "user_id" uuid not null, "token_hash" varchar(255) not null, "expires_at" timestamptz not null, "revoked_at" timestamptz null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "refresh_tokens_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "users" ("id" uuid not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "first_name" varchar(100) not null, "last_name" varchar(100) not null, "avatar_url" varchar(500) null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "users_pkey" primary key ("id"));`,
    );
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }

  override down(): void {
    this.addSql(`drop table if exists "account_members" cascade;`);

    this.addSql(`drop table if exists "accounts" cascade;`);

    this.addSql(`drop table if exists "invitation_tokens" cascade;`);

    this.addSql(`drop table if exists "refresh_tokens" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);
  }
}
