import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './shared/infrastructure/mikro-orm/config/mikro-orm.config';
import { HealthController } from './health.controller';
import { AuthModule } from '@/auth';
import { PipelineModule } from '@/pipeline';
import { ControlQuestionModule } from '@/control-question';
import { CustomFieldModule } from '@/custom-field';
import { SummaryModule } from '@/summary';
import { WorkflowModule } from '@/workflow';
import { OpportunityModule } from '@/opportunity';
import { JwtAuthGuard } from './auth/infrastructure/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    CqrsModule.forRoot(),
    AuthModule,
    PipelineModule,
    ControlQuestionModule,
    CustomFieldModule,
    SummaryModule,
    WorkflowModule,
    OpportunityModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
