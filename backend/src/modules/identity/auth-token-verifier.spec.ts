import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  JSONWebKeySet,
  KeyLike,
  SignJWT,
} from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { SupabaseAuthConfig } from '../../infrastructure/config/backend-config';
import { SupabaseTokenVerifier } from './auth-token-verifier';

const USER_ID = '00000000-0000-4000-8000-000000000001';
const CONFIG: SupabaseAuthConfig = {
  issuer: 'https://project.supabase.co/auth/v1',
  audience: 'authenticated',
  jwksUrl: 'https://project.supabase.co/auth/v1/.well-known/jwks.json',
};

describe('SupabaseTokenVerifier', () => {
  let verifier: SupabaseTokenVerifier;
  let privateKey: KeyLike;
  let rotatedPrivateKey: KeyLike;

  beforeAll(async () => {
    const keys = await generateKeyPair('RS256');
    privateKey = keys.privateKey;
    const publicJwk = await exportJWK(keys.publicKey);
    const rotatedKeys = await generateKeyPair('RS256');
    rotatedPrivateKey = rotatedKeys.privateKey;
    const rotatedPublicJwk = await exportJWK(rotatedKeys.publicKey);
    const jwks: JSONWebKeySet = {
      keys: [
        { ...publicJwk, alg: 'RS256', kid: 'test-signing-key' },
        { ...rotatedPublicJwk, alg: 'RS256', kid: 'rotated-signing-key' },
      ],
    };
    verifier = new SupabaseTokenVerifier(CONFIG, createLocalJWKSet(jwks));
  });

  async function sign(
    claims: Record<string, unknown> = {},
    options: { issuer?: string; audience?: string; expiresIn?: string } = {},
  ): Promise<string> {
    return new SignJWT({ sub: USER_ID, ...claims })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-signing-key' })
      .setIssuer(options.issuer ?? CONFIG.issuer)
      .setAudience(options.audience ?? CONFIG.audience)
      .setIssuedAt()
      .setExpirationTime(options.expiresIn ?? '5m')
      .sign(privateKey);
  }

  it('derives an immutable minimal learner principal from a valid subject', async () => {
    const token = await sign({
      role: 'service_role',
      user_metadata: { permission: 'admin' },
    });

    await expect(verifier.verify(token)).resolves.toEqual({
      subject: USER_ID,
      userId: USER_ID,
      permissions: ['account:establish:self', 'account:read:self'],
    });
  });

  it.each([
    ['wrong issuer', { issuer: 'https://attacker.example/auth/v1' }, {}],
    ['wrong audience', { audience: 'service_role' }, {}],
    ['expired', { expiresIn: '-1s' }, {}],
    ['future not-before', {}, { nbf: Math.floor(Date.now() / 1000) + 300 }],
    ['missing subject', {}, { sub: undefined }],
    ['non-UUID subject', {}, { sub: 'frontend-user-id' }],
  ])('rejects %s tokens', async (_name, options, claims) => {
    await expect(
      sign(claims, options).then((token) => verifier.verify(token)),
    ).rejects.toBeDefined();
  });

  it('rejects a token signed by an unknown key', async () => {
    const other = await generateKeyPair('RS256');
    const token = await new SignJWT({ sub: USER_ID })
      .setProtectedHeader({ alg: 'RS256', kid: 'rotated-unknown-key' })
      .setIssuer(CONFIG.issuer)
      .setAudience(CONFIG.audience)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(other.privateKey);

    await expect(verifier.verify(token)).rejects.toBeDefined();
  });

  it('accepts a valid token after a signing-key rotation', async () => {
    const token = await new SignJWT({ sub: USER_ID })
      .setProtectedHeader({ alg: 'RS256', kid: 'rotated-signing-key' })
      .setIssuer(CONFIG.issuer)
      .setAudience(CONFIG.audience)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(rotatedPrivateKey);

    await expect(verifier.verify(token)).resolves.toMatchObject({
      userId: USER_ID,
    });
  });
});
