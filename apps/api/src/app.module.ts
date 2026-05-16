import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './shared/infrastructure/mikro-orm/config/mikro-orm.config';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    CqrsModule.forRoot(),
  ],
  controllers: [HealthController],
})
export class AppModule {}
