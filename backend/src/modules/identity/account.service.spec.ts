import { describe, expect, it, vi } from 'vitest';
import { AccountRecord, AccountStore } from './account.repository';
import { AccountService } from './account.service';

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

  it('returns a safe not-found result for an unestablished account', async () => {
    const service = new AccountService(
      store({ findById: vi.fn().mockResolvedValue(undefined) }),
    );
    await expect(service.findCurrent(USER_ID)).rejects.toMatchObject({
      status: 404,
      message: 'Account not established',
    });
  });
});
