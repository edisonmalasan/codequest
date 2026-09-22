import { MODULE_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { loadBackendConfig } from './infrastructure/config/backend-config';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { LearningModule } from './modules/learning/learning.module';
import { ProgressModule } from './modules/progress/progress.module';

const inertModules = [
  IdentityModule,
  CurriculumModule,
  LearningModule,
  ProgressModule,
  GamificationModule,
];

const DATABASE_URL =
  'postgresql://codequest:local-password@127.0.0.1:5432/codequest';

describe('AppModule', () => {
  it('compiles all initial module boundaries', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule.register(
          loadBackendConfig({ NODE_ENV: 'test', DATABASE_URL }),
        ),
      ],
    }).compile();

    for (const moduleType of [...inertModules, HealthModule]) {
      expect(moduleRef.get(moduleType)).toBeInstanceOf(moduleType);
    }
    await moduleRef.close();
  });

  it('keeps domain placeholder modules provider-free and controller-free', () => {
    for (const moduleType of inertModules) {
      expect(
        Reflect.getMetadata(MODULE_METADATA.PROVIDERS, moduleType),
      ).toBeUndefined();
      expect(
        Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, moduleType),
      ).toBeUndefined();
      expect(
        Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleType),
      ).toBeUndefined();
    }
  });
});
