import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { GuestImportController } from './guest-import.controller';
import { LearningService } from './learning.service';
import { LearningSyncController } from './learning-sync.controller';

@Module({
  controllers: [
    LearningController,
    GuestImportController,
    LearningSyncController,
  ],
  providers: [LearningService],
})
export class LearningModule {}
