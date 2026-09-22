import { Inject, Injectable, Optional } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTVerifyGetKey } from 'jose';
import { SupabaseAuthConfig } from '../../infrastructure/config/backend-config';
import { AuthPrincipal, createAuthPrincipal } from './auth-principal';

export const SUPABASE_AUTH_CONFIG = Symbol('SUPABASE_AUTH_CONFIG');
export const AUTH_TOKEN_VERIFIER = Symbol('AUTH_TOKEN_VERIFIER');
export const AUTH_JWKS_RESOLVER = Symbol('AUTH_JWKS_RESOLVER');

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AuthTokenVerifier {
  verify(token: string): Promise<AuthPrincipal>;
}

@Injectable()
export class SupabaseTokenVerifier implements AuthTokenVerifier {
  private readonly keyResolver: JWTVerifyGetKey;

  constructor(
    @Inject(SUPABASE_AUTH_CONFIG)
    private readonly config: SupabaseAuthConfig,
    @Optional()
    @Inject(AUTH_JWKS_RESOLVER)
    keyResolver?: JWTVerifyGetKey,
  ) {
    this.keyResolver =
      keyResolver ?? createRemoteJWKSet(new URL(this.config.jwksUrl));
  }

  async verify(token: string): Promise<AuthPrincipal> {
    const { payload } = await jwtVerify(token, this.keyResolver, {
      algorithms: ['RS256', 'ES256'],
      issuer: this.config.issuer,
      audience: this.config.audience,
    });
    if (typeof payload.sub !== 'string' || !UUID_PATTERN.test(payload.sub)) {
      throw new Error('Invalid authentication subject');
    }
    return createAuthPrincipal(payload.sub);
  }
}
