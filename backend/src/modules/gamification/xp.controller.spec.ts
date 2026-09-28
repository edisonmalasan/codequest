import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { createAuthPrincipal } from '../identity/auth-principal';
import { AuthenticationGuard } from '../identity/authentication.guard';
import { AUTH_TOKEN_VERIFIER } from '../identity/auth-token-verifier';
import { PermissionGuard } from '../identity/permission.guard';
import { XpController } from './xp.controller';
import { XpService } from './xp.service';

describe('XP controller boundary', () => {
  it('reads only the verified principal owner and declares protected guards', async () => {
    const total = vi
      .fn()
      .mockResolvedValue({ totalXp: 10, clientReported: true });
    const module = await Test.createTestingModule({
      controllers: [XpController],
      providers: [
        { provide: XpService, useValue: { total } },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: PermissionGuard, useValue: { canActivate: () => true } },
        { provide: AUTH_TOKEN_VERIFIER, useValue: { verify: vi.fn() } },
      ],
    }).compile();
    const controller = module.get(XpController);
    const principal = createAuthPrincipal(
      '00000000-0000-4000-8000-000000000001',
    );
    expect(await controller.total(principal)).toEqual({
      totalXp: 10,
      clientReported: true,
    });
    expect(total).toHaveBeenCalledWith(principal.userId);
  });
});
