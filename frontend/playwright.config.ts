import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm exec next dev --hostname 127.0.0.1 --port 3100',
      url: 'http://127.0.0.1:3100/login',
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001',
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          'publishable-local-browser-fixture',
        NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3100',
        NEXT_PUBLIC_RUNTIME_ORIGIN: 'http://localhost:3100',
        NEXT_PUBLIC_PREVIEW_ORIGIN: 'http://localhost:3101',
      },
      timeout: 120_000,
    },
    {
      command: 'pnpm exec next dev --hostname localhost --port 3101',
      url: 'http://localhost:3101/preview/bootstrap.html',
      reuseExistingServer: !process.env.CI,
      env: {
        CODEQUEST_PREVIEW_BUILD: '1',
        NEXT_PUBLIC_PREVIEW_ORIGIN: 'http://localhost:3101',
        NEXT_PUBLIC_RUNTIME_ORIGIN: 'http://localhost:3100',
      },
      timeout: 120_000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      testMatch: '**/web-preview.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: '**/web-preview.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
