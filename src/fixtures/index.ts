import { getEnvConfig } from '@config/environments';
import type { APIRequestContext } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { ApiHelper, ParticipantHelper } from '@src/helpers';
import { AddParticipantPage, DashboardPage, LoginPage } from '@src/pages';
import type { EnvConfig, Environment } from '@src/types';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  addParticipantPage: AddParticipantPage;
};

type Helpers = {
  apiHelper: ApiHelper;
  participantHelper: ParticipantHelper;
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

  addParticipantPage: async ({ page }, use) => {
    await use(new AddParticipantPage(page));
  },

  apiHelper: async ({ request, envConfig }, use) => {
    await use(new ApiHelper(request as APIRequestContext, envConfig.apiBaseURL, envConfig.api.key));
  },

  participantHelper: async ({ request, envConfig }, use) => {
    await use(new ParticipantHelper(request as APIRequestContext, envConfig.apiBaseURL));
  },
});

export { expect };

