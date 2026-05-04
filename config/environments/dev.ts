import type { EnvConfig } from '@src/types';

export const devConfig: EnvConfig = {
  environment: 'dev',
  baseURL: process.env.BASE_URL ?? 'https://dev.smp.example.com',
  apiBaseURL: process.env.API_BASE_URL ?? 'https://api.dev.smp.example.com',
  credentials: {
    admin: {
      email: process.env.ADMIN_EMAIL ?? 'admin@dev.example.com',
      password: process.env.ADMIN_PASSWORD ?? '',
    },
    standardUser: {
      email: process.env.STANDARD_USER_EMAIL ?? 'user@dev.example.com',
      password: process.env.STANDARD_USER_PASSWORD ?? '',
    },
  },
  api: {
    key: process.env.API_KEY ?? '',
  },
  timeouts: {
    defaultNavigation: 30_000,
    defaultAction: 10_000,
    defaultExpect: 10_000,
  },
};
