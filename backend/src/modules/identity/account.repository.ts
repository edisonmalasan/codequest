import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseConnectionService } from '../../infrastructure/database/database-connection';
import { profiles, users } from '../../infrastructure/database/schema';

export interface AccountRecord {
  readonly id: string;
  readonly timezone: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AccountStore {
  establish(userId: string): Promise<AccountRecord>;
  findById(userId: string): Promise<AccountRecord | undefined>;
}

export const ACCOUNT_STORE = Symbol('ACCOUNT_STORE');

@Injectable()
export class AccountRepository implements AccountStore {
  constructor(private readonly connection: DatabaseConnectionService) {}

  async establish(userId: string): Promise<AccountRecord> {
    return this.connection.database.transaction(async (transaction) => {
      await transaction
        .insert(users)
        .values({ id: userId })
        .onConflictDoNothing();
      await transaction
        .insert(profiles)
        .values({ userId })
        .onConflictDoNothing();
      const account = await transaction
        .select({
          id: users.id,
          timezone: profiles.timezone,
          createdAt: users.createdAt,
          updatedAt: profiles.updatedAt,
        })
        .from(users)
        .innerJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);
      if (account[0] === undefined) {
        throw new Error('Account establishment failed');
      }
      return account[0];
    });
  }

  async findById(userId: string): Promise<AccountRecord | undefined> {
    const account = await this.connection.database
      .select({
        id: users.id,
        timezone: profiles.timezone,
        createdAt: users.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(users)
      .innerJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);
    return account[0];
  }
}
