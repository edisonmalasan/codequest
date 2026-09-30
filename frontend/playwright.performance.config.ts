import { defineConfig, devices } from '@playwright/test';

const origin = 'http://127.0.0.1:3200';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/performance.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  timeout: 90_000,
  use: { baseURL: origin, trace: 'retain-on-failure' },
  webServer: {
    command:
      'pnpm build && pnpm exec next start --hostname 0.0.0.0 --port 3200',
    url: `${origin}/offline.html`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001',
      NEXT_PUBLIC_SUPABASE_URL: 'https://auth.example.test',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-local-browser-fixture',
      NEXT_PUBLIC_SITE_URL: 'https://codequest.example.test',
      NEXT_PUBLIC_RUNTIME_ORIGIN: 'http://localhost:3200',
      NEXT_PUBLIC_PREVIEW_ORIGIN: 'http://127.0.0.2:3200',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
