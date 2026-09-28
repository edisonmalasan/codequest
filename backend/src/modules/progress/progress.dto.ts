import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength } from 'class-validator';

export class StartQuestDto {
  @ApiProperty({ type: String, example: '1.0.0' })
  @IsString()
  @MaxLength(32)
  contentVersion!: string;
}

export class UseHintDto extends StartQuestDto {
  @ApiProperty({ enum: ['question', 'concept', 'nextStep'] })
  @IsIn(['question', 'concept', 'nextStep'])
  hintKey!: 'question' | 'concept' | 'nextStep';
}

export class ActivityResponseDto {
  @ApiProperty({ type: String, example: 'Q01' }) questId!: string;
  @ApiProperty({ type: String, format: 'date-time' }) occurredAt!: string;
}

export class UnmetPrerequisiteDto {
  @ApiProperty({ type: String, example: 'Q01' }) questId!: string;
  @ApiProperty({ type: String, example: 'first-message' }) slug!: string;
  @ApiProperty({ type: String, example: 'First message' }) title!: string;
}

export class QuestProgressDto {
  @ApiProperty({ type: String, example: 'Q01' }) questId!: string;
  @ApiProperty({ enum: ['not_started', 'in_progress', 'completed'] })
  status!: 'not_started' | 'in_progress' | 'completed';
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  startedAt!: string | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  completedAt!: string | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastActivityAt!: string | null;
  @ApiProperty({ type: Number }) attemptCount!: number;
  @ApiProperty({ type: Number }) hintCount!: number;
  @ApiProperty({ enum: ['available', 'locked'] })
  availability!: 'available' | 'locked';
  @ApiProperty({ type: [UnmetPrerequisiteDto] })
  unmetPrerequisites!: UnmetPrerequisiteDto[];
}

export class ChapterProgressDto {
  @ApiProperty({ type: String, example: 'CH01' }) chapterId!: string;
  @ApiProperty({ enum: ['not_started', 'in_progress', 'completed'] })
  status!: QuestProgressDto['status'];
  @ApiProperty({ type: Number }) completedQuests!: number;
  @ApiProperty({ type: Number }) totalQuests!: number;
  @ApiProperty({ type: Number }) percentage!: number;
  @ApiProperty({ type: [QuestProgressDto] }) quests!: QuestProgressDto[];
  @ApiProperty({ enum: ['available', 'locked'] })
  availability!: 'available' | 'locked';
  @ApiProperty({ type: [UnmetPrerequisiteDto] })
  unmetPrerequisites!: UnmetPrerequisiteDto[];
}

export class JourneyProgressDto {
  @ApiProperty({ type: String, example: 'JAVASCRIPT-FOUNDATIONS' })
  journeyId!: string;
  @ApiProperty({ enum: ['not_started', 'in_progress', 'completed'] })
  status!: QuestProgressDto['status'];
  @ApiProperty({ type: Number }) completedQuests!: number;
  @ApiProperty({ type: Number }) totalQuests!: number;
  @ApiProperty({ type: Number }) percentage!: number;
  @ApiProperty({ type: [ChapterProgressDto] }) chapters!: ChapterProgressDto[];
  @ApiProperty({ enum: ['available', 'locked'] })
  availability!: 'available' | 'locked';
  @ApiProperty({ type: [UnmetPrerequisiteDto] })
  unmetPrerequisites!: UnmetPrerequisiteDto[];
}
