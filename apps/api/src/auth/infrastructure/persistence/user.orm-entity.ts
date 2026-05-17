import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../domain/entities/user.entity';

@Entity({ tableName: 'users' })
export class UserOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Property({ type: 'varchar', length: 255, fieldName: 'password_hash' })
  passwordHash!: string;

  @Property({ type: 'varchar', length: 100, fieldName: 'first_name' })
  firstName!: string;

  @Property({ type: 'varchar', length: 100, fieldName: 'last_name' })
  lastName!: string;

  @Property({
    type: 'varchar',
    length: 500,
    nullable: true,
    fieldName: 'avatar_url',
  })
  avatarUrl!: string | null;

  @Property({
    type: 'datetime',
    defaultRaw: 'CURRENT_TIMESTAMP',
    fieldName: 'created_at',
  })
  createdAt!: Date;

  constructor(params: {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.email = params.email;
    this.passwordHash = params.passwordHash;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.avatarUrl = params.avatarUrl;
    this.createdAt = params.createdAt;
  }

  toDomainEntity(): User {
    return User.fromPrimitives({
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      firstName: this.firstName,
      lastName: this.lastName,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
    });
  }
}
