import { Test } from '@nestjs/testing';
import { validate } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import { createAuthPrincipal } from '../identity/auth-principal';
import { AuthenticationGuard } from '../identity/authentication.guard';
import { AUTH_TOKEN_VERIFIER } from '../identity/auth-token-verifier';
import { PermissionGuard } from '../identity/permission.guard';
import { ProgressController } from './progress.controller';
import { StartQuestDto, UseHintDto } from './progress.dto';
import { ProgressService } from './progress.service';

const USER_ID = '00000000-0000-4000-8000-000000000001';

describe('progress controller trust boundary', () => {
  it('uses the verified principal for all activity and progress operations', async () => {
    const service = {
      start: vi.fn(),
      useHint: vi.fn(),
      quest: vi.fn(),
      chapter: vi.fn(),
      journey: vi.fn(),
    };
    const module = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        { provide: ProgressService, useValue: service },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: PermissionGuard, useValue: { canActivate: () => true } },
        { provide: AUTH_TOKEN_VERIFIER, useValue: { verify: vi.fn() } },
      ],
    }).compile();
    const controller = module.get(ProgressController);
    const principal = createAuthPrincipal(USER_ID);
    const start = { contentVersion: '1.0.0' };
    const hint = { ...start, hintKey: 'concept' as const };
    await controller.start(principal, 'first-message', start);
    await controller.hint(principal, 'first-message', hint);
    await controller.quest(principal, 'first-message');
    await controller.chapter(principal, 'variables');
    await controller.journey(principal, 'javascript-foundations');
    await controller.course(principal, 'javascript-foundations');
    expect(service.start).toHaveBeenCalledWith(USER_ID, 'first-message', start);
    expect(service.useHint).toHaveBeenCalledWith(
      USER_ID,
      'first-message',
      hint,
    );
    expect(service.quest).toHaveBeenCalledWith(USER_ID, 'first-message');
    expect(service.chapter).toHaveBeenCalledWith(USER_ID, 'variables');
    expect(service.journey).toHaveBeenCalledTimes(2);
  });

  it('rejects forged authority fields and unsupported hints', async () => {
    const start = Object.assign(new StartQuestDto(), {
      contentVersion: '1.0.0',
      userId: USER_ID,
      completed: true,
    });
    expect(
      (
        await validate(start, { whitelist: true, forbidNonWhitelisted: true })
      ).map((error) => error.property),
    ).toEqual(expect.arrayContaining(['userId', 'completed']));
    const hint = Object.assign(new UseHintDto(), {
      contentVersion: '1.0.0',
      hintKey: 'solution',
    });
    expect((await validate(hint)).map((error) => error.property)).toContain(
      'hintKey',
    );
  });
});
