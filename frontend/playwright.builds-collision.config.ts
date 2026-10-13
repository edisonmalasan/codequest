import { defineConfig, devices } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:3501';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/builds-origin-collision.spec.ts',
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: { baseURL: appOrigin, serviceWorkers: 'block' },
  webServer: {
    command:
      'pnpm build && pnpm exec next start --hostname 0.0.0.0 --port 3501',
    url: `${appOrigin}/runtime/interactive-worker.js`,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001',
      NEXT_PUBLIC_SUPABASE_URL: 'https://localhost:54322',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-local-browser-fixture',
      NEXT_PUBLIC_SITE_URL: 'https://codequest.example.test',
      NEXT_PUBLIC_RUNTIME_ORIGIN: appOrigin,
      NEXT_PUBLIC_PREVIEW_ORIGIN: 'http://localhost:3501',
      NEXT_PUBLIC_ANALYTICS_CAPTURE_APPROVED: 'false',
      NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED: 'false',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
