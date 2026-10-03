import { defineConfig, devices } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:3200';
const authOrigin = 'http://127.0.0.1:54321';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/visual-account.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  use: { baseURL: appOrigin, trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'node scripts/learning-auth-fixture.mjs',
      cwd: '../backend',
      url: `${authOrigin}/auth/v1/.well-known/jwks.json`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'pnpm exec next dev --hostname 0.0.0.0 --port 3200',
      url: `${appOrigin}/register`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001',
        NEXT_PUBLIC_SUPABASE_URL: authOrigin,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          'publishable-local-browser-fixture',
        NEXT_PUBLIC_SITE_URL: appOrigin,
        NEXT_PUBLIC_RUNTIME_ORIGIN: 'http://127.0.0.2:3200',
        NEXT_PUBLIC_PREVIEW_ORIGIN: 'http://localhost:3200',
      },
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
