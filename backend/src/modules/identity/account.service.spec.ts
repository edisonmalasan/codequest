import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  ACCOUNT_STORE,
  AccountRecord,
  AccountStore,
} from './account.repository';
import { AccountService } from './account.service';
import { AnalyticsService } from '../analytics/analytics.service';

const USER_ID = '00000000-0000-4000-8000-000000000001';
const ACCOUNT: AccountRecord = {
  id: USER_ID,
  timezone: 'UTC',
  createdAt: new Date('2026-09-22T00:00:00.000Z'),
  updatedAt: new Date('2026-09-22T00:00:01.000Z'),
};

function store(overrides: Partial<AccountStore> = {}): AccountStore {
  return {
    establish: vi.fn().mockResolvedValue(ACCOUNT),
    findById: vi.fn().mockResolvedValue(ACCOUNT),
    updateTimezone: vi.fn().mockResolvedValue(ACCOUNT),
    ...overrides,
  };
}

describe('AccountService', () => {
  it('passes only the derived principal ID to account persistence', async () => {
    const accountStore = store();
    const service = new AccountService(accountStore);

    await expect(service.establish(USER_ID)).resolves.toEqual({
      id: USER_ID,
      timezone: 'UTC',
      createdAt: '2026-09-22T00:00:00.000Z',
      updatedAt: '2026-09-22T00:00:01.000Z',
    });
    expect(accountStore.establish).toHaveBeenCalledWith(USER_ID);
  });

  it('emits signup once for a newly committed account and ignores a retry', async () => {
    const capture = vi.fn().mockResolvedValue(undefined);
    const accountStore = store({
      establish: vi
        .fn()
        .mockResolvedValueOnce({ ...ACCOUNT, newlyCreated: true })
        .mockResolvedValueOnce({ ...ACCOUNT, newlyCreated: false }),
    });
    const module = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: ACCOUNT_STORE, useValue: accountStore },
        { provide: AnalyticsService, useValue: { capture } },
      ],
    }).compile();
    const service = module.get(AccountService);
    await service.establish(USER_ID);
    await service.establish(USER_ID);
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith({
      name: 'signup_completed',
      ownerId: USER_ID,
      factId: USER_ID,
      occurredAt: ACCOUNT.createdAt,
    });
  });

  it('returns a safe not-found result for an unestablished account', async () => {
    const service = new AccountService(
      store({ findById: vi.fn().mockResolvedValue(undefined) }),
    );
    await expect(service.findCurrent(USER_ID)).rejects.toMatchObject({
      status: 404,
      message: 'Account not established',
    });
  });

  it('validates timezone before updating the derived owner', async () => {
    const accountStore = store({
      updateTimezone: vi
        .fn()
        .mockResolvedValue({ ...ACCOUNT, timezone: 'Asia/Manila' }),
    });
    const service = new AccountService(accountStore);
    await expect(
      service.updateTimezone(USER_ID, 'Asia/Manila'),
    ).resolves.toMatchObject({ timezone: 'Asia/Manila' });
    expect(accountStore.updateTimezone).toHaveBeenCalledWith(
      USER_ID,
      'Asia/Manila',
    );
    await expect(
      service.updateTimezone(USER_ID, '+08:00'),
    ).rejects.toMatchObject({ status: 400 });
    expect(accountStore.updateTimezone).toHaveBeenCalledTimes(1);
  });
});
