import { test as setup } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AuthHelper } from '@src/helpers';
import { getEnvConfig } from '@config/environments';
import type { Environment } from '@src/types';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local'), override: false });

const TEST_ENV = (process.env.TEST_ENV ?? 'dev') as Environment;
dotenv.config({ path: path.resolve(__dirname, '..', `.env.${TEST_ENV}`), override: false });

const env = getEnvConfig(TEST_ENV);

setup('authenticate as admin', async ({ page, context }) => {
  await AuthHelper.loginViaUI(page, env.credentials.admin);
  await AuthHelper.saveState(context, AuthHelper.adminStatePath);
});

setup('authenticate as standard user', async ({ page, context }) => {
  await AuthHelper.loginViaUI(page, env.credentials.standardUser);
  await AuthHelper.saveState(context, AuthHelper.standardUserStatePath);
});
