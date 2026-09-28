import { ApiProperty } from '@nestjs/swagger';

export class StreakDto {
  @ApiProperty({ type: Number, minimum: 0 }) currentStreak!: number;
  @ApiProperty({ type: Number, minimum: 0 }) longestStreak!: number;
  @ApiProperty({ type: String, example: 'Asia/Manila' }) timezone!: string;
  @ApiProperty({ type: String, format: 'date', nullable: true })
  latestActivityDate!: string | null;
  @ApiProperty({ type: Boolean, example: true }) clientReported!: boolean;
}
