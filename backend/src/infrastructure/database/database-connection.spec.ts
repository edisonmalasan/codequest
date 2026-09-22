import { describe, expect, it, vi } from 'vitest';
import { createDatabaseConnection } from './database-connection';

describe('createDatabaseConnection', () => {
  it('does not connect while constructing and closes cleanly', async () => {
    const unhandledRejection = vi.fn();
    process.on('unhandledRejection', unhandledRejection);

    const connection = createDatabaseConnection(
      'postgresql://codequest:local-password@127.0.0.1:1/codequest',
    );

    expect(connection.database).toBeDefined();
    await connection.close();
    await new Promise((resolve) => setImmediate(resolve));
    expect(unhandledRejection).not.toHaveBeenCalled();

    process.off('unhandledRejection', unhandledRejection);
  });
});
