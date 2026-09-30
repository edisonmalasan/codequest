import { defineConfig } from '@playwright/test';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import curriculum from './playwright.curriculum.config';

const captureFile = join(tmpdir(), 'codequest-analytics-playwright.jsonl');
const servers = Array.isArray(curriculum.webServer)
  ? curriculum.webServer
  : curriculum.webServer
    ? [curriculum.webServer]
    : [];

export default defineConfig({
  ...curriculum,
  testMatch: '**/analytics.spec.ts',
  webServer: servers.map((server, index) =>
    index === 0
      ? {
          ...server,
          command:
            'pnpm --dir ../backend exec tsx test/analytics-fixture-server.ts',
          env: {
            ...server.env,
            DATABASE_URL:
              process.env.DATABASE_TEST_URL ??
              server.env?.DATABASE_URL ??
              'postgresql://codequest:local-fixture@127.0.0.1:5432/codequest_test',
            CODEQUEST_ANALYTICS_FIXTURE_PATH: captureFile,
          },
        }
      : {
          ...server,
          env: {
            ...server.env,
            NEXT_PUBLIC_ANALYTICS_CAPTURE_APPROVED: 'true',
            NEXT_PUBLIC_POSTHOG_PROJECT_KEY: 'local_fixture_key',
            NEXT_PUBLIC_POSTHOG_HOST: 'https://capture.example.test',
          },
        },
  ),
});
