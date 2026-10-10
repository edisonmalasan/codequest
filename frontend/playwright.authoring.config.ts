import { defineConfig, devices } from '@playwright/test';

const appPort = process.env.CODEQUEST_AUTHOR_APP_PORT ?? '3310';
const appOrigin = `http://127.0.0.1:${appPort}`;
const runtimeOrigin = `http://localhost:${appPort}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/content-authoring.spec.ts',
  outputDir: process.env.CODEQUEST_AUTHOR_OUTPUT ?? './test-results/authoring',
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: appOrigin,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  webServer: {
    command: `pnpm exec next dev --hostname 0.0.0.0 --port ${appPort}`,
    url: `${appOrigin}/login`,
    reuseExistingServer: process.env.CODEQUEST_AUTHOR_REUSE_SERVER === '1',
    env: {
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001',
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-local-author-fixture',
      NEXT_PUBLIC_SITE_URL: appOrigin,
      NEXT_PUBLIC_RUNTIME_ORIGIN: runtimeOrigin,
      NEXT_PUBLIC_PREVIEW_ORIGIN: `http://127.0.0.2:${appPort}`,
    },
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
