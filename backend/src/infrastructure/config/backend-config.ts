export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface BackendEnvironment {
  NODE_ENV?: string;
  HOST?: string;
  PORT?: string;
  CORS_ORIGINS?: string;
  BODY_LIMIT_BYTES?: string;
  RATE_LIMIT_TTL_MS?: string;
  RATE_LIMIT_MAX?: string;
  DATABASE_URL?: string;
  SUPABASE_AUTH_ISSUER?: string;
  SUPABASE_AUTH_AUDIENCE?: string;
  SUPABASE_AUTH_JWKS_URL?: string;
}

export interface SupabaseAuthConfig {
  readonly issuer: string;
  readonly audience: string;
  readonly jwksUrl: string;
}

export interface BackendConfig {
  readonly environment: RuntimeEnvironment;
  readonly host: string;
  readonly port: number;
  readonly corsOrigins: readonly string[];
  readonly bodyLimitBytes: number;
  readonly rateLimitTtlMs: number;
  readonly rateLimitMax: number;
  readonly databaseUrl: string;
  readonly auth: SupabaseAuthConfig;
}

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
] as const;

function parseEnvironment(value: string | undefined): RuntimeEnvironment {
  const environment = value ?? 'development';
  if (
    environment !== 'development' &&
    environment !== 'test' &&
    environment !== 'production'
  ) {
    throw new Error(
      'Invalid NODE_ENV: expected development, test, or production',
    );
  }
  return environment;
}

function parseInteger(
  name: string,
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = value ?? String(fallback);
  if (!/^\d+$/.test(raw)) {
    throw new Error(`Invalid ${name}: expected an integer`);
  }

  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(
      `Invalid ${name}: expected a value between ${minimum} and ${maximum}`,
    );
  }
  return parsed;
}

function parseHost(value: string | undefined): string {
  const host = value ?? '127.0.0.1';
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9.:-]{0,253})$/.test(host)) {
    throw new Error('Invalid HOST: expected a hostname or IP address');
  }
  return host;
}

function parseDatabaseUrl(value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error('Invalid DATABASE_URL: a PostgreSQL URL is required');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Invalid DATABASE_URL');
  }

  if (
    (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') ||
    url.hostname === '' ||
    url.username === '' ||
    url.pathname.length <= 1
  ) {
    throw new Error('Invalid DATABASE_URL');
  }

  return value;
}

function parseAuthUrl(
  name: 'SUPABASE_AUTH_ISSUER' | 'SUPABASE_AUTH_JWKS_URL',
  value: string | undefined,
  environment: RuntimeEnvironment,
): URL {
  if (value === undefined || value.trim() === '') {
    throw new Error(`Invalid ${name}: a URL is required`);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid ${name}`);
  }

  if (
    (url.protocol !== 'https:' &&
      !(environment !== 'production' && url.protocol === 'http:')) ||
    url.username !== '' ||
    url.password !== '' ||
    url.search !== '' ||
    url.hash !== '' ||
    url.origin === 'null'
  ) {
    throw new Error(`Invalid ${name}`);
  }
  return url;
}

function parseAudience(value: string | undefined): string {
  if (
    value === undefined ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)
  ) {
    throw new Error('Invalid SUPABASE_AUTH_AUDIENCE');
  }
  return value;
}

function parseAuthConfig(
  env: BackendEnvironment,
  environment: RuntimeEnvironment,
): SupabaseAuthConfig {
  const issuer = parseAuthUrl(
    'SUPABASE_AUTH_ISSUER',
    env.SUPABASE_AUTH_ISSUER,
    environment,
  );
  const jwks = parseAuthUrl(
    'SUPABASE_AUTH_JWKS_URL',
    env.SUPABASE_AUTH_JWKS_URL,
    environment,
  );
  const issuerPath = issuer.pathname.replace(/\/+$/, '');
  const expectedJwksPath = `${issuerPath}/.well-known/jwks.json`;
  if (jwks.origin !== issuer.origin || jwks.pathname !== expectedJwksPath) {
    throw new Error('Invalid SUPABASE_AUTH_JWKS_URL');
  }

  return Object.freeze({
    issuer: `${issuer.origin}${issuerPath}`,
    audience: parseAudience(env.SUPABASE_AUTH_AUDIENCE),
    jwksUrl: jwks.toString(),
  });
}

function normalizeOrigin(value: string): string {
  if (value === '*') {
    throw new Error('Invalid CORS_ORIGINS: wildcard origins are not allowed');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Invalid CORS_ORIGINS entry');
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username !== '' ||
    url.password !== '' ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== '' ||
    url.origin === 'null'
  ) {
    throw new Error('Invalid CORS_ORIGINS entry');
  }
  return url.origin;
}

function parseCorsOrigins(
  value: string | undefined,
  environment: RuntimeEnvironment,
): readonly string[] {
  if (value === undefined || value.trim() === '') {
    if (environment === 'production') {
      throw new Error(
        'Invalid CORS_ORIGINS: production requires explicit allowed origins',
      );
    }
    return Object.freeze([...DEFAULT_CORS_ORIGINS]);
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '')
    .map(normalizeOrigin);

  if (origins.length === 0) {
    throw new Error('Invalid CORS_ORIGINS: provide at least one origin');
  }
  return Object.freeze([...new Set(origins)]);
}

export function loadBackendConfig(
  env: BackendEnvironment = process.env,
): BackendConfig {
  const environment = parseEnvironment(env.NODE_ENV);
  return Object.freeze({
    environment,
    host: parseHost(env.HOST),
    port: parseInteger('PORT', env.PORT, 3001, 1, 65_535),
    corsOrigins: parseCorsOrigins(env.CORS_ORIGINS, environment),
    bodyLimitBytes: parseInteger(
      'BODY_LIMIT_BYTES',
      env.BODY_LIMIT_BYTES,
      262_144,
      1_024,
      1_048_576,
    ),
    rateLimitTtlMs: parseInteger(
      'RATE_LIMIT_TTL_MS',
      env.RATE_LIMIT_TTL_MS,
      60_000,
      1_000,
      3_600_000,
    ),
    rateLimitMax: parseInteger(
      'RATE_LIMIT_MAX',
      env.RATE_LIMIT_MAX,
      120,
      1,
      10_000,
    ),
    databaseUrl: parseDatabaseUrl(env.DATABASE_URL),
    auth: parseAuthConfig(env, environment),
  });
}
