import type { EnvConfig } from '@src/types';

export const stagingConfig: EnvConfig = {
  environment: 'staging',
  baseURL: process.env.BASE_URL ?? 'https://staging.smp.example.com',
  apiBaseURL: process.env.API_BASE_URL ?? 'https://api.staging.smp.example.com',
  credentials: {
    admin: {
      email: process.env.ADMIN_EMAIL ?? 'admin@staging.example.com',
      password: process.env.ADMIN_PASSWORD ?? '',
    },
    standardUser: {
      email: process.env.STANDARD_USER_EMAIL ?? 'user@staging.example.com',
      password: process.env.STANDARD_USER_PASSWORD ?? '',
    },
  },
  api: {
    key: process.env.API_KEY ?? '',
  },
  timeouts: {
    defaultNavigation: 45_000,
    defaultAction: 15_000,
    defaultExpect: 15_000,
  },
};
