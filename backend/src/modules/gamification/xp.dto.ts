import { ApiProperty } from '@nestjs/swagger';

export class XpTotalDto {
  @ApiProperty({ type: Number, minimum: 0 }) totalXp!: number;
  @ApiProperty({ type: Boolean, example: true }) clientReported!: boolean;
  @ApiProperty({ type: Number, minimum: 1 }) level!: number;
  @ApiProperty({ type: Number, minimum: 0 }) levelStartXp!: number;
  @ApiProperty({ type: Number, minimum: 1 }) nextLevelAtXp!: number;
  @ApiProperty({ type: Number, minimum: 0 }) xpIntoLevel!: number;
  @ApiProperty({ type: Number, minimum: 1 }) xpToNextLevel!: number;
  @ApiProperty({ type: String, example: 'provisional-linear-100-v1' })
  curveId!: string;
  @ApiProperty({ type: Boolean, example: true }) curveProvisional!: boolean;
}
