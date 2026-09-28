import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabaseConnectionService } from '../../infrastructure/database/database-connection';
import { xpEvents } from '../../infrastructure/database/schema';
import { XpTotalDto } from './xp.dto';
import { deriveLevel } from './level-policy';

@Injectable()
export class XpService {
  constructor(
    @Inject(DatabaseConnectionService)
    private readonly connection: DatabaseConnectionService,
  ) {}

  async total(userId: string): Promise<XpTotalDto> {
    const [row] = await this.connection.database
      .select({
        total: sql<number>`coalesce(sum(${xpEvents.amount}), 0)::integer`,
      })
      .from(xpEvents)
      .where(eq(xpEvents.userId, userId));
    return {
      totalXp: row.total,
      clientReported: true,
      ...deriveLevel(row.total),
    };
  }
}
