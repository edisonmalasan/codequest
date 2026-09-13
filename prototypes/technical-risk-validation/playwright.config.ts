import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', timeout: 25000, expect: { timeout: 6000 }, workers: 1,
  reporter: [['line'], ['./scripts/evidence-reporter.mjs']],
  use: { baseURL: 'http://127.0.0.1:4310', headless: true, trace: 'off' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium', launchOptions: { args: ['--disable-gpu', '--renderer-process-limit=2'] } } }, { name: 'firefox', use: { browserName: 'firefox' } }, { name: 'webkit', use: { browserName: 'webkit' } }],
  webServer: { command: 'node scripts/serve.mjs', url: 'http://127.0.0.1:4310', reuseExistingServer: false, timeout: 10000 },
});
