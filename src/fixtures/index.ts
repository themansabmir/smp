import { test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { LoginPage, DashboardPage } from '@src/pages';
import { ApiHelper, DataFactory } from '@src/helpers';
import { getEnvConfig } from '@config/environments';
import type { Environment, EnvConfig } from '@src/types';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

type Helpers = {
  apiHelper: ApiHelper;
  dataFactory: typeof DataFactory;
};

type Config = {
  envConfig: EnvConfig;
};

type Fixtures = Pages & Helpers & Config;

const TEST_ENV = (process.env.TEST_ENV ?? 'dev') as Environment;

export const test = base.extend<Fixtures>({
  envConfig: async ({}, use) => {
    await use(getEnvConfig(TEST_ENV));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  apiHelper: async ({ request, envConfig }, use) => {
    await use(new ApiHelper(request as APIRequestContext, envConfig.apiBaseURL, envConfig.api.key));
  },

  dataFactory: async ({}, use) => {
    await use(DataFactory);
  },
});

export { expect };
