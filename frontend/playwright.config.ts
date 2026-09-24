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
  webServer: {
    command: 'pnpm exec next dev --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/login',
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001',
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-local-browser-fixture',
      NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3100',
    },
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
