import type { Environment, EnvConfig } from '@src/types';
import { devConfig } from './dev';
import { stagingConfig } from './staging';
import { prodConfig } from './prod';

const configs: Record<Environment, EnvConfig> = {
  dev: devConfig,
  staging: stagingConfig,
  prod: prodConfig,
};

export function getEnvConfig(env: Environment = 'dev'): EnvConfig {
  const config = configs[env];
  if (!config) {
    throw new Error(`Unknown environment: "${env}". Valid options: dev | staging | prod`);
  }
  return config;
}

export { devConfig, stagingConfig, prodConfig };
