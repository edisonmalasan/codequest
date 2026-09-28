import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTimezoneDto {
  @ApiProperty({ type: String, example: 'Asia/Manila' })
  @IsString()
  timezone!: string;
}
