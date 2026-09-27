import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAttemptDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  clientEventId!: string;

  @ApiProperty({ type: String, example: '1.0.0' })
  @IsString()
  @MaxLength(32)
  contentVersion!: string;

  @ApiProperty({ type: String, example: '1.0.0' })
  @IsString()
  @MaxLength(32)
  assessmentVersion!: string;

  @ApiProperty({
    type: String,
    description: 'Private source snapshot, at most 64 KiB',
  })
  @IsString()
  source!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  report!: Record<string, unknown>;
}

export class AttemptResponseDto {
  @ApiProperty({ type: String, format: 'uuid' }) id!: string;
  @ApiProperty({ type: String, example: 'Q01' }) questId!: string;
  @ApiProperty({ type: String, format: 'uuid' }) clientEventId!: string;
  @ApiProperty({ type: String, example: '1.0.0' }) contentVersion!: string;
  @ApiProperty({ type: String, example: '1.0.0' }) assessmentVersion!: string;
  @ApiProperty({ type: String, format: 'date-time' }) submittedAt!: string;
  @ApiProperty({ type: Number }) attemptCount!: number;
  @ApiProperty({ type: Boolean }) reportedPassed!: boolean;
  @ApiProperty({ type: Boolean }) accepted!: boolean;
  @ApiProperty({ type: Boolean, example: true }) clientReported!: boolean;
  @ApiProperty({ type: String }) source!: string;
  @ApiProperty({ type: 'object', additionalProperties: true })
  report!: Record<string, unknown>;
}

export class AttemptHistoryDto {
  @ApiProperty({ type: Number }) attemptCount!: number;
  @ApiProperty({ type: [AttemptResponseDto] }) attempts!: AttemptResponseDto[];
}
