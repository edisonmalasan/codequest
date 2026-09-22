import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { describe, expect, it, vi } from 'vitest';
import { createAuthPrincipal } from './auth-principal';
import { AuthenticationGuard } from './authentication.guard';
import { AuthTokenVerifier } from './auth-token-verifier';
import { PermissionGuard } from './permission.guard';
import { REQUIRED_PERMISSIONS } from './require-permissions';
import { attachPrincipal } from './request-principal';

const USER_ID = '00000000-0000-4000-8000-000000000001';
const TOKEN = 'header.payload.signature';

function contextFor(request: object, handler = () => undefined) {
  class TestController {
    readonly testBoundary = true;
  }
  return new ExecutionContextHost([request], TestController, handler);
}

describe('identity guards', () => {
  it('accepts exactly one Bearer token and attaches the verified principal', async () => {
    const verify = vi
      .fn<AuthTokenVerifier['verify']>()
      .mockResolvedValue(createAuthPrincipal(USER_ID));
    const request = { headers: { authorization: `Bearer ${TOKEN}` } };
    const guard = new AuthenticationGuard({ verify });

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(verify).toHaveBeenCalledWith(TOKEN);
    expect(Object.keys(request)).toEqual(['headers']);
  });

  it.each([
    undefined,
    '',
    TOKEN,
    `Basic ${TOKEN}`,
    `bearer ${TOKEN}`,
    `Bearer ${TOKEN} trailing`,
    'Bearer not-a-jwt',
  ])(
    'rejects malformed authorization %o without verification',
    async (authorization) => {
      const verify = vi.fn<AuthTokenVerifier['verify']>();
      const guard = new AuthenticationGuard({ verify });
      const request = { headers: { authorization } };

      await expect(
        guard.canActivate(contextFor(request)),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(verify).not.toHaveBeenCalled();
    },
  );

  it('redacts verifier failures behind one safe unauthorized error', async () => {
    const verify = vi
      .fn<AuthTokenVerifier['verify']>()
      .mockRejectedValue(new Error('private token claim value'));
    const guard = new AuthenticationGuard({ verify });

    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `Bearer ${TOKEN}` } }),
      ),
    ).rejects.toMatchObject({ message: 'Authentication required' });
  });

  it('requires declared backend permissions and denies by default', () => {
    const reflector = new Reflector();
    const permissionGuard = new PermissionGuard(reflector);
    const request = { headers: {} };
    attachPrincipal(request, createAuthPrincipal(USER_ID));

    const allowedHandler = () => undefined;
    Reflect.defineMetadata(
      REQUIRED_PERMISSIONS,
      ['account:read:self'],
      allowedHandler,
    );
    expect(
      permissionGuard.canActivate(contextFor(request, allowedHandler)),
    ).toBe(true);
    expect(() => permissionGuard.canActivate(contextFor(request))).toThrow(
      ForbiddenException,
    );

    const deniedHandler = () => undefined;
    Reflect.defineMetadata(
      REQUIRED_PERMISSIONS,
      ['account:establish:self', 'account:read:self', 'admin:write'],
      deniedHandler,
    );
    expect(() =>
      permissionGuard.canActivate(contextFor(request, deniedHandler)),
    ).toThrow(ForbiddenException);
  });
});
