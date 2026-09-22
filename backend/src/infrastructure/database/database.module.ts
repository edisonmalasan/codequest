import { DynamicModule, Global, Module } from '@nestjs/common';
import { DATABASE_URL, DatabaseConnectionService } from './database-connection';

@Global()
@Module({})
export class DatabaseModule {
  static register(databaseUrl: string): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        { provide: DATABASE_URL, useValue: databaseUrl },
        DatabaseConnectionService,
      ],
      exports: [DatabaseConnectionService],
    };
  }
}
