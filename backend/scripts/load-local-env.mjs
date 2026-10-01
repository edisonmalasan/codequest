/* global process, URL */

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const localEnvironmentFile = fileURLToPath(
  new URL('../.env.local', import.meta.url),
);

if (process.env.NODE_ENV !== 'production' && existsSync(localEnvironmentFile)) {
  process.loadEnvFile(localEnvironmentFile);
}
