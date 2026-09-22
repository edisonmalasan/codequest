import { describe, expect, it } from 'vitest';
import { loadFrontendAuthConfig } from './auth-config';

const ENV = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-local-test-key',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
} as const;

describe('loadFrontendAuthConfig', () => {
  it('builds the bounded callback configuration', () => {
    expect(loadFrontendAuthConfig(ENV)).toEqual({
      supabaseUrl: 'http://127.0.0.1:54321',
      publishableKey: 'publishable-local-test-key',
      siteUrl: 'http://localhost:3000',
      callbackUrl: 'http://localhost:3000/auth/callback',
    });
  });

  it.each([
    [{ ...ENV, NEXT_PUBLIC_SUPABASE_URL: '' }, 'NEXT_PUBLIC_SUPABASE_URL'],
    [
      { ...ENV, NEXT_PUBLIC_SITE_URL: 'https://user:secret@example.com' },
      'NEXT_PUBLIC_SITE_URL',
    ],
    [
      { ...ENV, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_private' },
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ],
    [
      {
        ...ENV,
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'https://auth.codequest.example',
        NEXT_PUBLIC_SITE_URL: 'http://codequest.example',
      },
      'NEXT_PUBLIC_SITE_URL',
    ],
  ])('rejects invalid public Auth configuration', (env, name) => {
    expect(() => loadFrontendAuthConfig(env)).toThrow(name);
  });
});
