export interface AppEnv {
  PORT?: string;
}

const DEFAULT_PORT = 3001;

export function getPort(env: AppEnv = process.env): number {
  const raw = env.PORT ?? String(DEFAULT_PORT);
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${raw}`);
  }
  return port;
}
