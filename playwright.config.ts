import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getEnvConfig } from './config/environments';
import type { Environment } from './src/types';

// Load .env.local first (personal overrides, gitignored), then the per-env file.
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: false });

const TEST_ENV = (process.env.TEST_ENV ?? 'dev') as Environment;
dotenv.config({ path: path.resolve(__dirname, `.env.${TEST_ENV}`), override: false });

const env = getEnvConfig(TEST_ENV);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 8,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],
  outputDir: 'test-results',
  use: {
    baseURL: env.baseURL,
    navigationTimeout: env.timeouts.defaultNavigation,
    actionTimeout: env.timeouts.defaultAction,
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ── Browser projects (run via --project dev | staging | prod) ────────────
    {
      name: 'dev',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: getEnvConfig('dev').baseURL,
      },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'staging',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: getEnvConfig('staging').baseURL,
      },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'prod',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: getEnvConfig('prod').baseURL,
      },
      testMatch: /.*\.spec\.ts/,
    },

    // ── Setup project (global auth state) ────────────────────────────────────
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
  ],
});

export { env, TEST_ENV };

