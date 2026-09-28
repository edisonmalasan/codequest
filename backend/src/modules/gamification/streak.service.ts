import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseConnectionService } from '../../infrastructure/database/database-connection';
import {
  profiles,
  streakActivityDays,
} from '../../infrastructure/database/schema';
import { deriveStreak, localDate } from './streak-policy';
import { StreakDto } from './streak.dto';

@Injectable()
export class StreakService {
  constructor(
    @Inject(DatabaseConnectionService)
    private readonly connection: DatabaseConnectionService,
  ) {}

  async current(userId: string, now = new Date()): Promise<StreakDto> {
    const [profile] = await this.connection.database
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    if (!profile) throw new NotFoundException('Account not established');
    const days = await this.connection.database
      .select({ date: streakActivityDays.activityDate })
      .from(streakActivityDays)
      .where(eq(streakActivityDays.userId, userId));
    return {
      ...deriveStreak(
        days.map((day) => day.date),
        localDate(now, profile.timezone),
      ),
      timezone: profile.timezone,
      clientReported: true,
    };
  }
}
