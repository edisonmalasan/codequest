export interface ApiEnv {
  NEXT_PUBLIC_API_URL?: string;
}

const DEFAULT_API_URL = 'http://127.0.0.1:3001';

export function getApiBaseUrl(env: ApiEnv = {}): string {
  const raw = env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  const url = raw.trim();
  if (url.length === 0) {
    throw new Error('NEXT_PUBLIC_API_URL must not be empty');
  }
  return url.replace(/\/+$/, '');
}

export function getConfiguredApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  return getApiBaseUrl(
    configured === undefined ? {} : { NEXT_PUBLIC_API_URL: configured },
  );
}
