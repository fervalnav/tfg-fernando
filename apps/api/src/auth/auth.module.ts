import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';

// ORM Entities
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { AccountOrmEntity } from './infrastructure/persistence/account.orm-entity';
import { AccountMemberOrmEntity } from './infrastructure/persistence/account-member.orm-entity';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/refresh-token.orm-entity';
import { InvitationTokenOrmEntity } from './infrastructure/persistence/invitation-token.orm-entity';

// Repositories
import { UserRepository } from './domain/repositories/user.repository';
import { AccountRepository } from './domain/repositories/account.repository';
import { AccountMemberRepository } from './domain/repositories/account-member.repository';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository';
import { InvitationTokenRepository } from './domain/repositories/invitation-token.repository';
import { MikroOrmUserRepository } from './infrastructure/persistence/mikro-orm-user.repository';
import { MikroOrmAccountRepository } from './infrastructure/persistence/mikro-orm-account.repository';
import { MikroOrmAccountMemberRepository } from './infrastructure/persistence/mikro-orm-account-member.repository';
import { MikroOrmRefreshTokenRepository } from './infrastructure/persistence/mikro-orm-refresh-token.repository';
import { MikroOrmInvitationTokenRepository } from './infrastructure/persistence/mikro-orm-invitation-token.repository';

// Strategies & Guards
import { LocalStrategy } from './infrastructure/passport/local.strategy';
import { JwtStrategy } from './infrastructure/passport/jwt.strategy';

// Token Services
import { TokenService } from './infrastructure/token/token.service';
import { AuthSessionService } from './infrastructure/token/auth-session.service';

// Controllers
import { AuthController } from './infrastructure/io/auth.controller';
import { AccountController } from './infrastructure/io/account.controller';
import { UserController } from './infrastructure/io/user.controller';

// Command Handlers
import { RegisterHandler } from './application/commands/auth/register';
import { LoginHandler } from './application/commands/auth/login';
import { RefreshTokenHandler } from './application/commands/auth/refresh-token';
import { LogoutHandler } from './application/commands/auth/logout';
import { SwitchAccountHandler } from './application/commands/auth/switch-account';
import { AcceptInvitationHandler } from './application/commands/account/accept-invitation';
import { InviteMemberHandler } from './application/commands/account/invite-member';
import { RemoveMemberHandler } from './application/commands/account/remove-member';
import { UpdateMemberRoleHandler } from './application/commands/account/update-member-role';
import { UpdateProfileHandler } from './application/commands/user/update-profile';
import { UpdateAvatarHandler } from './application/commands/user/update-avatar';

// Query Handlers
import { GetMeHandler } from './application/queries/auth/get-me';
import { FindMembersHandler } from './application/queries/account/find-members';

// Shared Modules
import { EmailModule } from '../shared/infrastructure/email/email.module';
import { StorageModule } from '../shared/infrastructure/storage/storage.module';
import { IdService } from '../shared/domain/services/id.service';

const commandHandlers = [
  RegisterHandler,
  AcceptInvitationHandler,
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  SwitchAccountHandler,
  InviteMemberHandler,
  RemoveMemberHandler,
  UpdateMemberRoleHandler,
  UpdateProfileHandler,
  UpdateAvatarHandler,
];

const queryHandlers = [GetMeHandler, FindMembersHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),

        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '1h') },
      }),
    }),
    MikroOrmModule.forFeature([
      UserOrmEntity,
      AccountOrmEntity,
      AccountMemberOrmEntity,
      RefreshTokenOrmEntity,
      InvitationTokenOrmEntity,
    ]),
    EmailModule,
    StorageModule,
  ],
  controllers: [AuthController, AccountController, UserController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    LocalStrategy,
    JwtStrategy,
    TokenService,
    AuthSessionService,
    IdService,
    { provide: UserRepository, useClass: MikroOrmUserRepository },
    { provide: AccountRepository, useClass: MikroOrmAccountRepository },
    {
      provide: AccountMemberRepository,
      useClass: MikroOrmAccountMemberRepository,
    },
    {
      provide: RefreshTokenRepository,
      useClass: MikroOrmRefreshTokenRepository,
    },
    {
      provide: InvitationTokenRepository,
      useClass: MikroOrmInvitationTokenRepository,
    },
  ],
})
export class AuthModule {}
