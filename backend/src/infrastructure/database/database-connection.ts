import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import { databaseSchema } from './schema';

export const DATABASE_URL = Symbol('DATABASE_URL');

export interface DatabaseConnection {
  readonly database: PostgresJsDatabase<typeof databaseSchema>;
  close(): Promise<void>;
}

export function createDatabaseConnection(url: string): DatabaseConnection {
  const client: Sql = postgres(url, {
    max: 10,
    prepare: false,
    onnotice: () => undefined,
  });

  return {
    database: drizzle(client, { schema: databaseSchema }),
    async close(): Promise<void> {
      await client.end({ timeout: 5 });
    },
  };
}

@Injectable()
export class DatabaseConnectionService implements OnModuleDestroy {
  readonly database: PostgresJsDatabase<typeof databaseSchema>;
  private readonly connection: DatabaseConnection;

  constructor(@Inject(DATABASE_URL) databaseUrl: string) {
    this.connection = createDatabaseConnection(databaseUrl);
    this.database = this.connection.database;
  }

  async onModuleDestroy(): Promise<void> {
    await this.connection.close();
  }
}
