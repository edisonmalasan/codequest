import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { GuestImportController } from './guest-import.controller';
import { LearningService } from './learning.service';

@Module({
  controllers: [LearningController, GuestImportController],
  providers: [LearningService],
})
export class LearningModule {}
