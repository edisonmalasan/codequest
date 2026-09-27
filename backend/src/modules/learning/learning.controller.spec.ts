import { validate } from 'class-validator';
import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { createAuthPrincipal } from '../identity/auth-principal';
import { AuthenticationGuard } from '../identity/authentication.guard';
import { AUTH_TOKEN_VERIFIER } from '../identity/auth-token-verifier';
import { PermissionGuard } from '../identity/permission.guard';
import { CreateAttemptDto } from './attempt.dto';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

const USER_ID = '00000000-0000-4000-8000-000000000001';

describe('learning controller boundary', () => {
  it('uses the verified principal owner for submission and history', async () => {
    const submit = vi.fn().mockResolvedValue({ id: 'attempt' });
    const history = vi
      .fn()
      .mockResolvedValue({ attemptCount: 0, attempts: [] });
    const module = await Test.createTestingModule({
      controllers: [LearningController],
      providers: [
        { provide: LearningService, useValue: { submit, history } },
        { provide: AuthenticationGuard, useValue: { canActivate: () => true } },
        { provide: PermissionGuard, useValue: { canActivate: () => true } },
        { provide: AUTH_TOKEN_VERIFIER, useValue: { verify: vi.fn() } },
      ],
    }).compile();
    const controller = module.get(LearningController);
    const principal = createAuthPrincipal(USER_ID);
    const body = new CreateAttemptDto();
    body.clientEventId = '00000000-0000-4000-8000-000000000002';
    body.contentVersion = '1.0.0';
    body.assessmentVersion = '1.0.0';
    body.source = 'hello';
    body.report = {};
    await controller.submit(principal, 'first-message', body);
    await controller.history(principal, 'first-message');
    expect(submit).toHaveBeenCalledWith(USER_ID, 'first-message', body);
    expect(history).toHaveBeenCalledWith(USER_ID, 'first-message');
  });

  it('rejects unexpected owner and completion fields', async () => {
    const body = Object.assign(new CreateAttemptDto(), {
      clientEventId: '00000000-0000-4000-8000-000000000002',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'hello',
      report: {},
      userId: USER_ID,
      accepted: true,
    });
    const errors = await validate(body, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['userId', 'accepted']),
    );
  });
});
