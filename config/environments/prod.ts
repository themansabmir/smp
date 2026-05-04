import type { EnvConfig } from '@src/types';

export const prodConfig: EnvConfig = {
  environment: 'prod',
  baseURL: process.env.BASE_URL ?? 'https://smp.example.com',
  apiBaseURL: process.env.API_BASE_URL ?? 'https://api.smp.example.com',
  credentials: {
    admin: {
      email: process.env.ADMIN_EMAIL ?? '',
      password: process.env.ADMIN_PASSWORD ?? '',
    },
    standardUser: {
      email: process.env.STANDARD_USER_EMAIL ?? '',
      password: process.env.STANDARD_USER_PASSWORD ?? '',
    },
  },
  api: {
    key: process.env.API_KEY ?? '',
  },
  timeouts: {
    defaultNavigation: 60_000,
    defaultAction: 20_000,
    defaultExpect: 20_000,
  },
};
