import { defineConfig, devices } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:3500';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/builds-production.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: appOrigin,
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    serviceWorkers: 'block',
  },
  webServer: {
    command:
      'pnpm build && pnpm exec next start --hostname 0.0.0.0 --port 3500',
    url: `${appOrigin}/builds`,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001',
      NEXT_PUBLIC_SUPABASE_URL: 'https://localhost:54322',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-local-browser-fixture',
      NEXT_PUBLIC_SITE_URL: 'https://codequest.example.test',
      NEXT_PUBLIC_RUNTIME_ORIGIN: 'http://127.0.0.2:3500',
      NEXT_PUBLIC_PREVIEW_ORIGIN: 'http://localhost:3500',
      NEXT_PUBLIC_ANALYTICS_CAPTURE_APPROVED: 'false',
      NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED: 'false',
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
