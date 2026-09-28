import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { Test } from '@nestjs/testing';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AccountRepository } from './account.repository';
import { DatabaseConnectionService } from '../../infrastructure/database/database-connection';

const USER_A = '00000000-0000-4000-8000-000000000001';
const USER_B = '00000000-0000-4000-8000-000000000002';

describe('account timezone persistence', () => {
  let client: PGlite;
  let repository: AccountRepository;

  beforeEach(async () => {
    client = await PGlite.create();
    const database = drizzle(client);
    await migrate(database, { migrationsFolder: resolve('drizzle') });
    const module = await Test.createTestingModule({
      providers: [
        AccountRepository,
        { provide: DatabaseConnectionService, useValue: { database } },
      ],
    }).compile();
    repository = module.get(AccountRepository);
  });

  afterEach(async () => {
    await client.close();
  });

  it('updates only the verified owner and leaves other profiles unchanged', async () => {
    await repository.establish(USER_A);
    await repository.establish(USER_B);
    expect(
      await repository.updateTimezone(USER_A, 'Asia/Manila'),
    ).toMatchObject({
      id: USER_A,
      timezone: 'Asia/Manila',
    });
    expect(await repository.findById(USER_B)).toMatchObject({
      timezone: 'UTC',
    });
    expect(
      await repository.updateTimezone(
        '00000000-0000-4000-8000-000000000003',
        'UTC',
      ),
    ).toBeUndefined();
  });
});
