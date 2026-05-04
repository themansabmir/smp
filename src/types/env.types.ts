export type Environment = 'dev' | 'staging' | 'prod';

export interface EnvConfig {
  environment: Environment;
  baseURL: string;
  apiBaseURL: string;
  credentials: {
    admin: UserCredentials;
    standardUser: UserCredentials;
  };
  api: {
    key: string;
  };
  timeouts: {
    defaultNavigation: number;
    defaultAction: number;
    defaultExpect: number;
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}
