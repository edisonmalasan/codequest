import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: '**/accessibility.spec.ts',
  testIgnore: [],
  timeout: 90_000,
  webServer: Array.isArray(base.webServer) ? base.webServer[0] : base.webServer,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
