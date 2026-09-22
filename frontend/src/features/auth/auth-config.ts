export interface AuthEnvironment {
  readonly NODE_ENV?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly NEXT_PUBLIC_SITE_URL?: string;
}

export interface FrontendAuthConfig {
  readonly supabaseUrl: string;
  readonly publishableKey: string;
  readonly siteUrl: string;
  readonly callbackUrl: string;
}

function parsePublicOrigin(
  name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SITE_URL',
  value: string | undefined,
  production: boolean,
): string {
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
      !(production === false && url.protocol === 'http:')) ||
    url.username !== '' ||
    url.password !== '' ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== '' ||
    url.origin === 'null'
  ) {
    throw new Error(`Invalid ${name}`);
  }
  return url.origin;
}

function parsePublishableKey(value: string | undefined): string {
  if (
    value === undefined ||
    value.length < 16 ||
    value.length > 2_048 ||
    [...value].some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127;
    }) ||
    /service[_-]?role|sb_secret_/i.test(value)
  ) {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }
  return value;
}

export function loadFrontendAuthConfig(
  env: AuthEnvironment = process.env,
): FrontendAuthConfig {
  const production = env.NODE_ENV === 'production';
  const supabaseUrl = parsePublicOrigin(
    'NEXT_PUBLIC_SUPABASE_URL',
    env.NEXT_PUBLIC_SUPABASE_URL,
    production,
  );
  const siteUrl = parsePublicOrigin(
    'NEXT_PUBLIC_SITE_URL',
    env.NEXT_PUBLIC_SITE_URL,
    production,
  );
  return Object.freeze({
    supabaseUrl,
    publishableKey: parsePublishableKey(
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
    siteUrl,
    callbackUrl: `${siteUrl}/auth/callback`,
  });
}
