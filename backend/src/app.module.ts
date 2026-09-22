import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BackendConfig } from './infrastructure/config/backend-config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { CurriculumCatalog } from './modules/curriculum/content/curriculum-catalog';
import { GamificationModule } from './modules/gamification/gamification.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { LearningModule } from './modules/learning/learning.module';
import { ProgressModule } from './modules/progress/progress.module';

export const BACKEND_CONFIG = Symbol('BACKEND_CONFIG');

export interface AppModuleOptions {
  readonly curriculumCatalog?: CurriculumCatalog;
}

@Module({})
export class AppModule {
  static register(
    config: BackendConfig,
    options: AppModuleOptions = {},
  ): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DatabaseModule.register(config.databaseUrl),
        ThrottlerModule.forRoot([
          {
            ttl: config.rateLimitTtlMs,
            limit: config.rateLimitMax,
          },
        ]),
        IdentityModule.register(config.auth),
        CurriculumModule.register({ catalog: options.curriculumCatalog }),
        LearningModule,
        ProgressModule,
        GamificationModule,
        HealthModule,
      ],
      providers: [
        { provide: BACKEND_CONFIG, useValue: config },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    };
  }
}
