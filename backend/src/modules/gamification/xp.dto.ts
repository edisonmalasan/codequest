import { ApiProperty } from '@nestjs/swagger';

export class XpTotalDto {
  @ApiProperty({ type: Number, minimum: 0 }) totalXp!: number;
  @ApiProperty({ type: Boolean, example: true }) clientReported!: boolean;
}
