import { Module } from '@nestjs/common';
import { XpController } from './xp.controller';
import { XpService } from './xp.service';
import { StreakController } from './streak.controller';
import { StreakService } from './streak.service';

@Module({
  controllers: [XpController, StreakController],
  providers: [XpService, StreakService],
})
export class GamificationModule {}
