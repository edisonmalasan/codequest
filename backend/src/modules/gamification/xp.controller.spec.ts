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
    const response = {
      totalXp: 10,
      clientReported: true,
      level: 1,
      levelStartXp: 0,
      nextLevelAtXp: 100,
      xpIntoLevel: 10,
      xpToNextLevel: 90,
      curveId: 'provisional-linear-100-v1',
      curveProvisional: true,
    };
    const total = vi.fn().mockResolvedValue(response);
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
    expect(await controller.total(principal)).toEqual(response);
    expect(total).toHaveBeenCalledWith(principal.userId);
  });
});
